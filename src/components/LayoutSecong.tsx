import Navbar from "./Navbar";
import Header from "./Header";
import bg_img from "/bg_img.png";
const LayoutSecong = () => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen  bg-cover bg-center"
      style={{ backgroundImage: `url(${bg_img})` }}
    >
      <Navbar />
      <Header />
    </div>
  );
};

export default LayoutSecong;
