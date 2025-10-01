import React from 'react';
import Slider from 'react-slick';


const SimpleSlider: React.FC = () => {
  const settings = {
   dots: true,
   arrows:true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const box: React.CSSProperties = {
    height: 240,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 48
  };

  return (
    <div style={{ maxWidth: 720, margin: '40px auto' }}>
      <Slider {...settings}>
        <div><div style={{ ...box, background: '#eee' }}>1</div></div>
        <div><div style={{ ...box, background: '#ddd' }}>2</div></div>
        <div><div style={{ ...box, background: '#ccc' }}>3</div></div>
        <div><div style={{ ...box, background: '#bbb' }}>4</div></div>
        <div><div style={{ ...box, background: '#aaa' }}>5</div></div>
        <div><div style={{ ...box, background: '#999' }}>6</div></div>
      </Slider>
    </div>
  );
};

export default SimpleSlider;
