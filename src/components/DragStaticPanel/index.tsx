import { CSSProperties, useLayoutEffect, useRef } from "react";
import { Panel as DragStaticPanel } from "./panel";
import styles from "./Panel.module.less";

interface PanelProps {
  hidden?: boolean;
  children: React.ReactNode;
}

function Panel({ hidden, children }: PanelProps) {
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
        minSize: {
          width: 350,
          height: 400,
        },
      },
      canDrag: (target) => true
    });

    return () => {
      panelRef.current?.destroy();
    }
  }, []);

  const onToggle = () => {
    panelRef.current?.toggle({
      // 绝对设置
      position: {
        x: 100,
        y: 200,
      },
      size: {
        width: 350,
        height: 500,
      },
      // 如果上述任一值没写，会使用切换前的设置，并计算偏差
      offset: {
        x: 100,
        y: 100,
      },
      // 是否使用记忆位置
      usingPrevSets: true
    });
  }

  return (
    <div hidden={hidden}>
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
