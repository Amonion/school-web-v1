import React from "react";
import Image from "next/image";

type ResponsiveMediaProps = {
  url: string;
  type: "image" | "video" | "youtube";
};

const ResponsiveMedia: React.FC<ResponsiveMediaProps> = ({ url, type }) => {
  if (!url || !type) {
    return <p>Invalid props provided. Please provide both url and type.</p>;
  }

  if (type === "image") {
    return (
      <Image
        alt={`Media of ${url}`}
        src={String(url)}
        width={0}
        sizes="100vw"
        height={0}
        style={{ width: "50px", height: "auto" }}
      />
    );
  } else if (type === "youtube") {
    const youtubeEmbedUrl = url.replace("watch?v=", "embed/");
    return (
      <div
        style={{
          position: "relative",
          paddingBottom: "56.25%",
          height: 0,
          overflow: "hidden",
        }}
      >
        <iframe
          src={youtubeEmbedUrl}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video"
        ></iframe>
      </div>
    );
  } else if (type === "video") {
    return (
      <div
        style={{
          position: "relative",
          paddingBottom: "56.25%",
          height: 0,
          overflow: "hidden",
        }}
      >
        <video
          controls
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  } else {
    return <p>Unsupported media type</p>;
  }
};

export default ResponsiveMedia;
