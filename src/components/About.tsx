const About = () => {
  return (
    <section id="about">
      <h3 className="section-header">About Me</h3>
      <p>
        Hey there! I'm Lee, an ML engineer at <a href="https://cursor.com">Cursor</a>, where I work on
        training data for coding models.
      </p>
      <p>
        Before that, I was a founding engineer at <a href="https://convex.dev">Convex</a>, building a realtime database and full-stack
        backend framework with pluggable components. And before that, I worked on the distributed
        filesystem at <a href="https://www.dropbox.com">Dropbox</a>.
      </p>
      <p>
        At Yale, I double-majored in Computer Science and Math (with a Master's in CS).
        For my thesis I wrote a verified compiler in Coq for Ethereum, supervised by Professor Zhong Shao of <a href="https://www.certik.com/">CertiK</a>.
      </p>
      <p>I love teaching and collaborative learning.</p>
        <ul>
          <li>Teaching assistant for CS50 (intro), CS223 (data structures), CS323 (systems), CS365 (algorithms), Math235 (reflection groups), and CS468 (complexity theory)</li>
          <li>At Convex I answered customer questions in Discord</li>
          <li>At Dropbox I answered questions from client teams in Slack at all hours</li>
          <li>Built iOS apps to solve calculus problems, physics labs, and simulate Turing machines</li>
          <li>Built JavaScript physics simulations to support the physics curriculum in high school</li>
        </ul>
      <p>
        These days I'm most excited about AI and machine learning: building training data pipelines,
        designing RL environments with clean reward signals, and evaluating coding agents. When I'm not
        thinking about models and data, you might find me tinkering with formal verification or doing
        thought experiments on AI alignment.
      </p>
    </section>
  );
};

export default About; 