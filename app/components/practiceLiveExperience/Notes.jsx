import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { Button } from "reactstrap";
import "./index.css";
const Notes = ({
  isOpen,
  onClose,
  title,
  desc,
  style,
  triangle,
  nextFunc,
}) => {
  return (
    <div
      className="guide-note-container"
      style={{
        ...style,
        opacity : isOpen ? 1 : 0,
      }}
    >
      <div 
      className="cross-btn"
      style={{
        // display : triangle === 'clip-select' ? 'none' : 'flex',
        left : triangle === "triangle-right" ? "-10px" : "auto",
        right : triangle === "triangle-right" ? "auto" : "-10px",
      }}
      >
        <RxCross2
          style={{
            fontSize: "15px",
            color: "#000080",
          }}
          onClick={() => {
            onClose(false);
          }}
        />
      </div>
      <div>
        <h4
         style={{
        textAlign :  "left",
      }}
        >{title}</h4>
        <p
         style={{
        fontSize : '12px',
        textAlign :  "left",
      }}
        >{desc}</p>
      </div>
      <div
        style={{
          display : triangle === 'clip-select' ? 'none' : 'flex',
          justifyContent: "flex-end",
          marginTop: "10px",
        }}
      >
        <Button
          style={{
            padding: "5px 10px",
            fontSize: "10px",
            backgroundColor: "#fff",
            color: "#000080",
          }}
          onClick={() => {
            nextFunc();
          }}
        >
          Next
        </Button>
      </div>

      <div className={triangle}></div>
    </div>
  );
};

export default Notes;
