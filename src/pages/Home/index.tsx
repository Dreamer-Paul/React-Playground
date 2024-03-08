import { Link } from "react-router-dom";
import reactLogo from "@/assets/react.svg";
import styles from "./Home.module.less";

function PageHome() {
  return (
    <div className={styles.index}>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className={styles.logo} alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className={`${styles.logo} ${styles.react}`} alt="React logo" />
        </a>
      </div>
      <h1>Paul's React Playground</h1>
      <div className={styles.list}>
        <Link to="/drag-static-panel">拖拽静态轮换面板</Link>
        <Link to="/drag-button">靠右拖拽按钮</Link>
      </div>
    </div>
  );
}

export default PageHome;
