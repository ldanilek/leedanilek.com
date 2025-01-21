const Header = () => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header id="header">
      <h1>Lee Danilek</h1>
      <nav>
        <ul>
          <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')}>About</a></li>
          <li><a href="#links" onClick={(e) => scrollToSection(e, 'links')}>Links</a></li>
          <li><a href="#projects" onClick={(e) => scrollToSection(e, 'projects')}>Projects</a></li>
          <li><a href="#reading" onClick={(e) => scrollToSection(e, 'reading')}>Reading List</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header; 