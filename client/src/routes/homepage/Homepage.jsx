import { Link } from "react-router-dom";
import "./homepage.css";
import { TypeAnimation } from "react-type-animation";
import { useState } from "react";
import { SplashCursor } from "@/components/ui/splash-cursor"

const Homepage = () => {
  const [typingStatus, setTypingStatus] = useState("human1");

  return (
    <div className="homepage">
          <SplashCursor />

      <img src="/orbital.png" alt="" className="orbital" />
      <div className="left">
        <h1>MY GPT</h1>
        <TypeAnimation
              sequence={[
                "Piers :Hi, This is my live project, try it and have fun ",
                2000,
                () => {
                  setTypingStatus("bot");
                }
              ]}
              wrapper="span"
              repeat={Infinity}
              cursor={true}
              omitDeletionAnimation={true}
            />
        <Link to="/dashboard">Get Started</Link>
      </div>
      <div className="right">
        <div className="imgContainer">
          <div className="bgContainer">
            <div className="bg"></div>
          </div>
          <img src="https://www.esciencecenter.nl/wp-content/uploads/2024/11/83714_image-512x300.png" alt="" className="" />
          <div className="chat">
            <img
              src={
                typingStatus === "human1"
                  ? "/human1.jpeg"
                  : typingStatus === "human2"
                  ? "/human2.jpeg"
                  : "bot.png"
              }
              alt=""
            />
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                () => {
                  setTypingStatus("bot");
                },
                "Hi, I am a fullstack developer",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "I am proficient in web development",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "I have experience in Vue.js, React.js, Node.js, Express.js, MongoDB and Typescript",
                2000,
                () => {
                  setTypingStatus("bot");
                }
              ]}
              wrapper="span"
              repeat={Infinity}
              cursor={true}
              omitDeletionAnimation={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
