import logoImg from "/img/d3.jpeg";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <span>
          <img src={logoImg} alt="" />
        </span>
        MedEase
      </div>
    </nav>
  );
}
