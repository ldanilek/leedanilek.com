const Projects = () => {
  return (
    <section id="projects">
      <h3 className="section-header">Projects</h3>

      <h4>Cursor</h4>
      <p>
        <a href="https://cursor.com">Cursor</a>, the AI code editor.
      </p>
      <ul>
        <li><a href="https://cursor.com/blog/composer-2-5">Composer 2.5</a> - constructed tens of trillions of midtraining tokens for Cursor's coding model.</li>
        <li><a href="https://cursor.com/blog/bugbot-out-of-beta">Bugbot</a> - a GitHub integration that finds bugs in pull requests.</li>
        <li>Evals - internal platform for evaluating models from Slack, on arbitrary model, dataset, client, and harness versions.</li>
      </ul>

      <h4>Convex</h4>
      <p>
        <a href="https://convex.dev">Convex</a>, an <a href="https://github.com/get-convex/convex-backend">open source</a> application platform.
      </p>
      <ul>
        <li><a href="https://www.convex.dev/components/aggregate">Aggregate</a> - a component for performing aggregations on a Convex table.</li>
        <li><a href="https://github.com/ldanilek/table-history">Table History</a> - a component for recording history of a Convex table.</li>
        <li><a href="https://crates.io/crates/short_future">short_future</a> - a rust crate for making async functions retriable.</li>
        <li><a href="https://stack.convex.dev/author/lee-danilek">Technical articles</a> describing advanced patterns</li>
      </ul>

      <h4>Research</h4>
      <p style={{ display: 'flex', alignItems: 'center' }}>
        <a href="thesis.pdf" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Thesis</a>: Verified Compiler from a Subset of C to Ethereum Bytecode
      </p>
      
      <h4>Physics Simulations</h4>
      <ul>
        <li><a href="physics/springLab.html">Slinky Lab</a> - Interactive spring motion simulation</li>
        <li><a href="physics/collisionLab.html">Collisions Lab</a> - Particle collision physics simulator</li>
        <li><a href="physics/keplerLab.html">Gravity Lab</a> - Orbital mechanics visualization</li>
        <li><a href="physics/projectileLab.html">Projectile Lab</a> - Interactive projectile motion study</li>
        <li><a href="physics/newtonLab.html">Forces Lab</a> - Newtonian mechanics demonstration</li>
        <li><a href="physics/bridgeBuilder.html">Bridge Builder</a> - Structural engineering simulator</li>
      </ul>

      <h4>Applications</h4>
      <ul>
        <li><a href="/ios">View All iOS Apps</a> - Collection of published iOS applications</li>
        <li><a href="https://play-turing.vercel.app/" target="_blank">Play Turing</a> - Puzzle game where you program a Turing machine</li>
        <li><a href="/tide.py">Tides Calculator</a> - Tool for predicting tidal patterns</li>
      </ul>
    </section>
  );
};

export default Projects; 