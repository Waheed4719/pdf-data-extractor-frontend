const Button = ({ style, onClick, title, children }) => {
  return (
    <button style={{ ...style }} onClick={onClick}>
      {title ?? children}
    </button>
  );
};

export default Button;
