import { jest } from '@jest/globals';

describe('index.js Component Tests', () => {
  let index;

  beforeAll(async () => {
    index = await import('../../index.js');
  });

  describe('transformJobsForSOLR', () => {
    it('should filter locations to only Romanian cities', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', location: ['România'] },
          { url: 'https://test.com/2', title: 'Job 2', location: ['Sibiu'] },
          { url: 'https://test.com/3', title: 'Job 3', location: ['Bulgaria'] },
          { url: 'https://test.com/4', title: 'Job 4', location: ['Cluj-Napoca'] },
          { url: 'https://test.com/5', title: 'Job 5', location: [] }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].location).toEqual(['România']);
      expect(result.jobs[1].location).toEqual(['Sibiu']);
      expect(result.jobs[2].location).toEqual(['România']);
      expect(result.jobs[3].location).toEqual(['Cluj-Napoca']);
      expect(result.jobs[4].location).toEqual(['România']);
    });

    it('should keep company uppercase', () => {
      const payload = {
        source: 'sobis-ap.ro',
        company: 'sobis ap s.r.l.',
        cif: '52200796',
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', company: 'sobis ap', cif: '52200796' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.company).toBe('SOBIS AP S.R.L.');
    });

    it('should normalize workmode values', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', workmode: 'Remote' },
          { url: 'https://test.com/2', title: 'Job 2', workmode: 'ON-SITE' },
          { url: 'https://test.com/3', title: 'Job 3', workmode: 'Hybrid' },
          { url: 'https://test.com/4', title: 'Job 4', workmode: 'hybrid' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].workmode).toBe('remote');
      expect(result.jobs[1].workmode).toBe('on-site');
      expect(result.jobs[2].workmode).toBe('hybrid');
      expect(result.jobs[3].workmode).toBe('hybrid');
    });

    it('should handle empty jobs array', () => {
      const result = index.transformJobsForSOLR({ jobs: [] });
      expect(result.jobs).toEqual([]);
    });
  });

  describe('mapToJobModel', () => {
    it('should map raw job to job model format', () => {
      const rawJob = {
        url: 'https://sobis-ap.ro/cariere/#careers-panel-test-job',
        title: 'Consultant Implementare — WEB',
        location: ['Sibiu'],
        tags: ['html', 'css', 'javascript'],
        workmode: 'on-site'
      };

      const COMPANY_NAME = 'SOBIS AP S.R.L.';
      const COMPANY_CIF = '52200796';

      const result = index.mapToJobModel(rawJob, COMPANY_CIF, COMPANY_NAME);

      expect(result.url).toBe(rawJob.url);
      expect(result.title).toBe(rawJob.title);
      expect(result.company).toBe(COMPANY_NAME);
      expect(result.cif).toBe(COMPANY_CIF);
      expect(result.location).toEqual(rawJob.location);
      expect(result.tags).toEqual(rawJob.tags);
      expect(result.workmode).toBe(rawJob.workmode);
      expect(result.status).toBe('scraped');
      expect(result.date).toBeDefined();
    });

    it('should remove undefined fields', () => {
      const rawJob = {
        url: 'https://test.com/1',
        title: 'Job 1'
      };

      const result = index.mapToJobModel(rawJob, '52200796');

      expect(result.location).toBeUndefined();
      expect(result.tags).toBeUndefined();
      expect(result.workmode).toBeUndefined();
    });

    it('should handle missing title', () => {
      const rawJob = { url: 'https://test.com/1' };

      const result = index.mapToJobModel(rawJob, '52200796');

      expect(result.title).toBeUndefined();
      expect(result.url).toBe('https://test.com/1');
    });
  });

  describe('parseCareersHtml', () => {
    it('should parse SOBIS AP careers page HTML', () => {
      const html = `
        <html>
        <body>
          <main class="careers-page">
            <div class="careers-job-list">
              <button class="careers-job-tab" id="careers-tab-test-job" data-job-target="test-job">
                <span class="careers-job-tab-topline">Junior / Sibiu, România</span>
                <strong>Consultant Implementare — WEB</strong>
                <span class="careers-job-tab-department">Implementare aplicații web</span>
                <span class="careers-job-tab-vacancies">1 post disponibil</span>
              </button>
            </div>
            <div class="careers-job-panels">
              <article class="careers-job-panel" id="careers-panel-test-job" data-job-panel="test-job">
                <header class="careers-job-panel-header">
                  <div>
                    <span class="careers-job-panel-label">Implementare aplicații web</span>
                    <h2>Consultant Implementare — WEB</h2>
                  </div>
                </header>
                <div class="careers-job-meta">
                  <span>Sibiu, România</span>
                  <span>On-site</span>
                  <span>Full-time, perioadă nedeterminată</span>
                  <span>Junior</span>
                  <span>1 post disponibil</span>
                  <span>Deadline: 30 septembrie 2026</span>
                </div>
                <div class="careers-job-intro"><p>Job description here.</p></div>
              </article>
            </div>
          </main>
        </body>
        </html>
      `;

      const result = index.parseCareersHtml(html);

      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0].title).toBe('Consultant Implementare — WEB');
      expect(result.jobs[0].location).toEqual(['Sibiu, România']);
      expect(result.jobs[0].workmode).toBe('on-site');
      expect(result.jobs[0].department).toBe('Implementare aplicații web');
      expect(result.jobs[0].url).toContain('#careers-panel-test-job');
    });

    it('should handle empty HTML', () => {
      const result = index.parseCareersHtml('<html><body></body></html>');
      expect(result.jobs).toEqual([]);
    });

    it('should handle multiple job panels', () => {
      const html = `
        <html>
        <body>
          <main class="careers-page">
            <div class="careers-job-list">
              <button class="careers-job-tab" id="careers-tab-job-1" data-job-target="job-1">
                <span class="careers-job-tab-topline">Junior / Sibiu</span>
                <strong>Job One</strong>
                <span class="careers-job-tab-department">Dept A</span>
                <span class="careers-job-tab-vacancies">1 post</span>
              </button>
              <button class="careers-job-tab" id="careers-tab-job-2" data-job-target="job-2">
                <span class="careers-job-tab-topline">Senior / Sibiu</span>
                <strong>Job Two</strong>
                <span class="careers-job-tab-department">Dept B</span>
                <span class="careers-job-tab-vacancies">2 posturi</span>
              </button>
            </div>
            <div class="careers-job-panels">
              <article class="careers-job-panel" id="careers-panel-job-1" data-job-panel="job-1">
                <header class="careers-job-panel-header"><div><h2>Job One</h2></div></header>
                <div class="careers-job-meta"><span>Sibiu</span><span>On-site</span><span>2 posturi</span></div>
                <div class="careers-job-intro"><p>Desc 1</p></div>
              </article>
              <article class="careers-job-panel" id="careers-panel-job-2" data-job-panel="job-2">
                <header class="careers-job-panel-header"><div><h2>Job Two</h2></div></header>
                <div class="careers-job-meta"><span>Sibiu</span><span>Remote</span><span>1 post</span></div>
                <div class="careers-job-intro"><p>Desc 2</p></div>
              </article>
            </div>
          </main>
        </body>
        </html>
      `;

      const result = index.parseCareersHtml(html);

      expect(result.jobs.length).toBeGreaterThanOrEqual(2);
      expect(result.jobs[0].title).toBe('Job One');
      expect(result.jobs[1].title).toBe('Job Two');
    });
  });
});
