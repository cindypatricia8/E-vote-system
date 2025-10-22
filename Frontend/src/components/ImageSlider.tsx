import { useState} from "react"
import { ArrowBigLeft, ArrowBigRight, Circle, CircleDot } from "lucide-react"
import "./image-slider.css"

type Position = "President" | "Vice President" | "Secretary" | "Treasurer";

type Candidate = {
  id:string;
  first_name: string;
  last_name:string;
  position: Position;
  img:string;
  vision: string;
  mission:string;
}

type ImageSliderProps = {
  imageUrls: Candidate[]
}

export function ImageSlider({ imageUrls }: ImageSliderProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const current = imageUrls[imageIndex];

  function showNextImage() {
    setImageIndex(index => {
      if (index === imageUrls.length - 1) return 0
      return index + 1
    })
  }

  function showPrevImage() {
    setImageIndex(index => {
      if (index === 0) return imageUrls.length - 1
      return index - 1
    })
  }

  const fullName = `${current.first_name} ${current.last_name}`;
  return (
    <div className="container">
      
      <img src={current.img} className="img-slider-img"  />

      <button 
      onClick ={showPrevImage} 
      className="img-slider-btn" 
      style={{ left:0 }}
      aria-label="View Previous Candidate"
      >
        <ArrowBigLeft />
      </button>
      <button 
      onClick = {showNextImage} 
      className="img-slider-btn" 
      style= {{ right: 0}}
      aria-label="View Next Candidate"
      >
        <ArrowBigRight />
      </button>

      <div className="message" aria-live="polite">
        <h3>{fullName} </h3>
         <h4>Vision</h4>
        <p>{current.vision}</p>
        <h4>Mission</h4>
        <p>{current.mission}</p>
      </div>

      <div style= {{
        position: "absolute",
        bottom: ".5rem",
        left: "50%",
        translate: "-50%",
        display: "flex",
        gap: ".25rem",
      }}>
        {imageUrls.map((_,index) => (
          <button key={index} 
          className="img-slider-dot-btn" 
          aria-label={`View Candidate ${index}`}
          onClick= {() => setImageIndex(index)}
          >
            {index=== imageIndex ? <CircleDot /> : <Circle />}
          </button>
        ))}
      </div>
    </div>
  )
}
