import { useLayoutEffect, useRef } from "react";
import { Panel as DragStaticPanel } from "./panel";
import styles from "./Panel.module.less";

interface PanelProps {
  children: React.ReactNode;
}

function Panel({ children }: PanelProps) {
  const panelRef = useRef<DragStaticPanel>();
  const overlayRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !overlayRef.current || !resizerRef.current) {
      return;
    }

    panelRef.current = new DragStaticPanel({
      wrapper: wrapperRef.current,
      overlay: overlayRef.current,
      resizer: {
        el: resizerRef.current,
      }
    });

    return () => {
      panelRef.current?.destroy();
    }
  }, []);

  const onToggle = () => {
    panelRef.current?.toggle({}, true);
  }

  return (
    <div>
      <div ref={overlayRef} className={styles.overlay}></div>
      <div ref={wrapperRef} className={styles.panel}>
        <div ref={resizerRef} className={styles.resizer}></div>
        <div className={styles.header}>
          <button onClick={onToggle}>Toggle</button>
        </div>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Panel;
