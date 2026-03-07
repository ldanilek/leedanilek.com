const About = () => {
  return (
    <section id="about">
      <h3 className="section-header">About Me</h3>
      <p>
        Hey there! I'm Lee, a software engineer at Cursor, where I work across machine
        learning (midtraining), infra (tool calls and Tab), platform (agent harness),
        and product (Bugbot).
      </p>
      <p>
        Previously, I built features to make app development amazing at Convex: a realtime
        database and full-stack backend framework with pluggable components. Before that,
        I worked on the distributed filesystem, file restorations, and partner
        integrations at Dropbox.
      </p>
      <p>
        At Yale, I double-majored in Computer Science and Math (with a Master's in CS).
        For my thesis I wrote a verified compiler in Coq for Ethereum, supervised by Professor Zhong Shao of <a href="https://www.certik.com/">CertiK</a>.
      </p>
      <p>I love teaching and collaborative learning.</p>
        <ul>
          <li>Teaching assistant for CS50 (intro), CS223 (data structures), CS323 (systems), CS365 (algorithms), Math235 (reflection groups), and CS468 (complexity theory)</li>
          <li>At Convex I answer customer questions in Discord</li>
          <li>At Dropbox I answered questions from client teams in Slack at all hours</li>
          <li>Built iOS apps to solve calculus problems, physics labs, and simulate Turing machines</li>
          <li>Built JavaScript physics simulations to support the physics curriculum in high school</li>
        </ul>
      <p>
        I love diving deep into complex technical challenges, especially in API design
        and database consistency models. When I'm not thinking about data models and simplifying APIs, you 
        might find me tinkering with formal verification or doing thought experiments on AI alignment.
      </p>
    </section>
  );
};

export default About; 