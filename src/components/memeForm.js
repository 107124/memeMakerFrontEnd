import React from "react";
import DropzoneComponent from "react-dropzone-component";
import request from "superagent";
import { navigate } from "hookrouter";

import "../../node_modules/react-dropzone-component/styles/filepicker.css";
import "../../node_modules/dropzone/dist/min/dropzone.min.css";
import "../style/main.scss";

const MemeForm = props => {
  const [input, setInput] = React.useState("");
  const [favorite, setFavorite] = React.useState(false);
  const [image, setImage] = React.useState("");
  const imageRef = React.useRef(null);

  React.useEffect(() => {
    if (props.id && props.editMode) {
      fetch(`http://localhost:5000/meme/${props.id}`)
        .then(response => response.json())
        .then(data => {
          setInput(data.text);
          setFavorite(data.favorite);
        });
    }
  }, []);

  const componentConfig = () => {
    return {
      iconFiletypes: [".jpg", ".png"],
      showFiletypeIcon: true,
      postUrl: "https://httpbin.org/post"
    };
  };

  const handleDrop = () => {
    return {
      addedfile: file => {
        let upload = request
          .post("https://api.cloudinary.com/v1_1/dwqdcfplf/image/upload")
          .field("upload_preset", "meme-images")
          .field("file", file);

        upload.end((err, response) => {
          if (err) {
            console.log("cloudinary error", error);
          }
          if (response.body.secure_url) {
            setImage(response.body.secure_url);
          }
        });
      }
    };
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (props.editMode) {
      await fetch(`http://localhost:5000/meme/${props.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          text: input,
          favorite: favorite
        })
      })
        .then(imageRef.current.dropzone.removeAllFiles())
        .catch(error => console.log("put error", error));

      navigate("/");
    } else {
      await fetch("http://localhost:5000/add-meme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          text: input,
          image: image,
          favorite: favorite
        })
      })
        .then(result => result.json())
        .then(setInput(""))
        .then(setImage(""))
        .then(setFavorite(false))
        .then(imageRef.current.dropzone.removeAllFiles())
        .then(navigate("/"))
        .catch(err => console.log("form submit", err));
    }
  };

  const djsConfig = () => {
    return {
      addRemoveLinks: true,
      maxFiles: 1
    };
  };

  return (
    <div className="memeform">
      <h1>Add a Meme, please.</h1>
      <form onSubmit={handleSubmit}>
        <DropzoneComponent
          ref={imageRef}
          config={componentConfig()}
          djsConfig={djsConfig()}
          eventHandlers={handleDrop()}
        >
          Drop Your Meme
        </DropzoneComponent>
        <input
          className="caption-input"
          type="text"
          placeholder="Caption"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div>
          <input
            className="favorite-checkbox"
            type="checkbox"
            checked={favorite}
            onChange={() => setFavorite(!favorite)}
          />
          <span>Favorite?</span>
        </div>

        <button type="submit">Post Meme</button>
      </form>
    </div>
  );
};

export default MemeForm;
