import { useLayoutEffect, useRef } from "react";
import { Panel as PanelLogic } from "./panel";
import styles from "./Panel.module.less";

interface PanelProps {
  children: React.ReactElement;
}

function Panel({ children }: PanelProps) {
  const panelRef = useRef<any>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !overlayRef.current) {
      return;
    }

    panelRef.current = new PanelLogic({
      wrapper: wrapperRef.current,
      overlay: overlayRef.current,
    });

    return () => {
      panelRef.current.destroy();
    }
  }, []);

  const onToggle = () => {
    panelRef.current.toggle();
  }

  return (
    <div>
      <div ref={overlayRef} className={styles.overlay}></div>
      <div ref={wrapperRef} className={styles.panel}>
        <button onClick={onToggle}>Toggle</button>
        {children}
      </div>
    </div>
  )
}

export default Panel;
