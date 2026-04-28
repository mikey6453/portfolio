export const content = {
  About: {
    title: 'About',
    body: `
      <p>Hi, I'm Michael. I've always been drawn to figuring things out — modding Skyrim as a kid eventually became diving into computer science at UVA. I didn't grow up coding, but problem-solving was always the constant.</p>
      <p>Over time that curiosity turned into real work: ML projects predicting crash severity in Virginia, hands-on SQL injection training modules, AI-driven backend systems where LLMs interact with tools and data.</p>
      <p>What motivates me most is building things that feel <em>tangible</em> — systems where you can see the impact, whether it's helping someone learn or turning a fuzzy idea into something people use.</p>
      <p>Lately I've been deep on AI agents — what it actually means to "build" one, where the real value lives, and how these systems get past demos into something reliable.</p>
    `,
  },

  Experience: {
    title: 'Experience',
    body: `
      <ul class="timeline">
        <li>
          <div class="role">Software Developer</div>
          <div class="org">BreakPoint Labs <span class="dates">· Sep 2025 – Apr 2026</span></div>
          <p>Full-stack work on an AI-adjacent product — backend integrations, evaluation tooling, and operational infrastructure. Backend services wiring heterogeneous data sources and tools; evaluation frameworks for non-deterministic systems; database-level work to keep query results lean; operational tooling for backups, retention, and recovery.</p>
        </li>
        <li>
          <div class="role">DevOps Engineer Intern</div>
          <div class="org">Dataprise <span class="dates">· Jul 2024 – Sep 2024</span></div>
          <p>Infrastructure and tooling work in a managed-services environment.</p>
        </li>
        <li>
          <div class="role">Software Developer / Researcher</div>
          <div class="org">UVA Department of CS <span class="dates">· Jun 2024 – May 2025</span></div>
          <p>Research and development across cybersecurity and education projects.</p>
        </li>
        <li>
          <div class="role">Teaching Assistant — CS 1112</div>
          <div class="org">University of Virginia <span class="dates">· Aug 2023 – Dec 2023</span></div>
          <p>Helped intro-CS students build their first mental models of code.</p>
        </li>
      </ul>
    `,
  },

  Projects: {
    title: 'Projects',
    body: `
      <div class="projects">
        <div class="project">
          <h3>HoosReport</h3>
          <div class="tags">Python · Django · PostgreSQL · AWS S3 · Heroku</div>
          <p>Live anonymous reporting web app that preserves reporter identity and gives admins a stateful review-and-resolve workflow. Files served via time-limited presigned URLs. Served as Requirements Manager on a 5-person team.</p>
        </div>
        <div class="project">
          <h3>MealMap</h3>
          <div class="tags">React · Google Maps API · Travel Advisor · Material-UI</div>
          <p>React app integrating Google Maps + Travel Advisor APIs to surface restaurants live as you pan and zoom. Bounding-box queries tied to viewport changes; geolocation seeds the initial view.</p>
        </div>
        <div class="project">
          <h3>Seam Carving</h3>
          <div class="tags">Python · Pillow</div>
          <p>Content-aware image resizing using dynamic programming over a pixel-energy map. Backtracks the minimum-energy seam and removes it — resizing while preserving the parts that matter visually.</p>
        </div>
        <div class="project">
          <h3>EDURange SQL Injection Module</h3>
          <div class="tags">SQL · Pedagogy · EDURange</div>
          <p>Authored hands-on SQL injection exercises (UNION attacks) that boosted student success rates by 35%. Refined difficulty curve from student feedback + activity logs.</p>
        </div>
      </div>
    `,
  },

  Skills: {
    title: 'Skills',
    body: `
      <div class="skill-group">
        <h3>Languages</h3>
        <p>Python · TypeScript · JavaScript · SQL · Java · C</p>
      </div>
      <div class="skill-group">
        <h3>AI / LLM</h3>
        <p>Anthropic SDK · OpenAI · LangChain · Tool-use / agents · Evaluation frameworks · Prompt engineering</p>
      </div>
      <div class="skill-group">
        <h3>Backend &amp; Infra</h3>
        <p>Django · Node.js · PostgreSQL · AWS (S3, EC2) · Heroku · Docker · CI/CD · Linux</p>
      </div>
      <div class="skill-group">
        <h3>Foundations</h3>
        <p>Data Structures &amp; Algorithms · Database Systems · Computer Systems · Machine Learning · Artificial Intelligence</p>
      </div>
      <div class="skill-group">
        <h3>Certifications</h3>
        <p>CompTIA Security+</p>
      </div>
    `,
  },

  Contact: {
    title: 'Contact',
    body: `
      <p>I'm always up to talk about agent systems, evaluation tooling, or building things end-to-end.</p>
      <ul class="contact-list">
        <li><span>Email</span><a href="mailto:j.michael.park@gmail.com">j.michael.park@gmail.com</a></li>
        <li><span>GitHub</span><a href="https://github.com/mikey6453" target="_blank" rel="noopener">github.com/mikey6453</a></li>
        <li><span>LinkedIn</span><a href="https://www.linkedin.com/in/mikeypark/" target="_blank" rel="noopener">linkedin.com/in/mikeypark</a></li>
      </ul>
      <p class="muted">Based in Virginia · open to remote and on-site roles.</p>
    `,
  },
};
