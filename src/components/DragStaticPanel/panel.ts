import { MouseEvent, TouchEvent } from "react";

export const isMobile = navigator.userAgent.toLocaleLowerCase().includes("mobi");

export const eventName = {
  up: isMobile ? "touchend" : "mouseup",
  down: isMobile ? "touchstart" : "mousedown",
  move: isMobile ? "touchmove" : "mousemove"
};

interface IProps {
  wrapper: HTMLElement
  overlay: HTMLElement
  resizer?: {
    el: HTMLElement
  }
}

interface IObj {
  wrapper?: HTMLElement
  overlay?: HTMLElement
  resizer?: HTMLElement
}

export class Panel {
  private obj: IObj = {
    wrapper: undefined,
    overlay: undefined,
    resizer: undefined,
  }

  private state = {
    draggable: false,
    resizeable: false,
    // 点击位置坐标
    location: {
      x: -1,
      y: -1
    },
    // 记录容器坐标
    translate: {
      x: -1,
      y: -1
    },
    // 记录调整的大小
    size: {
      width: -1,
      height: -1
    }
  }

  constructor({ wrapper, overlay, resizer }: IProps) {
    this.obj.wrapper = wrapper;
    this.obj.overlay = overlay;

    if (resizer) {
      this.obj.resizer = resizer.el;
      this.state.resizeable = true;
    }

    this.wrapperMove.init();
    this.wrapperResize.init();
    this.windowResizeCheck.init();
  }

  public destroy = () => {
    this.wrapperMove.init();
    this.wrapperResize.destroy();
    this.windowResizeCheck.destroy();
  }

  // 修改容器坐标
  public setPosition = (x: number, y: number) => {
    const { wrapper } = this.obj;

    if (!wrapper) return;

    this.state.translate.x = x;
    this.state.translate.y = y;

    wrapper.style.transform = `translate(${x}px, ${y}px)`;
  }

  // 修改容器大小
  public setSize = (w: number | undefined, h: number | undefined) => {
    const { wrapper } = this.obj;

    if (!wrapper) return;

    if (w) {
      this.state.size.width = w;
      wrapper.style.width = `${w}px`;
    }

    if (h) {
      this.state.size.height = h;
      wrapper.style.height = `${h}px`;
    }
  }

  // 静态转拖拽
  public staticToFixed = (offsetProps = {}, usingPrevSets: boolean = false) => {
    if (!this.obj.wrapper) return;

    this.state.draggable = true;

    const offset = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      ...offsetProps
    };

    const { wrapper } = this.obj;
    const { size, translate } = this.state;

    // 如果需要还原成之前的坐标和位置
    if (usingPrevSets && (size.width > -1 || size.width > -1) && (translate.x > -1 || translate.y > -1)) {
      this.fixPositionAndSize();
    }
    else {
      const w = wrapper.clientWidth + offset.width;
      const h = wrapper.clientHeight + offset.height;
      this.setSize(w, h);

      const x = wrapper.offsetLeft + offset.x;
      const y = wrapper.offsetTop + offset.y;
      this.setPosition(x, y);
    }

    wrapper.classList.add("draggable");

    wrapper.style.top = "0";
    wrapper.style.left = "0";
    wrapper.style.position = "fixed";
  }

  // 拖拽转静态
  public fixedToStatic = () => {
    if (!this.obj.wrapper) return;

    this.state.draggable = false;

    const { wrapper } = this.obj;

    wrapper.classList.remove("draggable");

    wrapper.style.top = "";
    wrapper.style.left = "";
    wrapper.style.width = "";
    wrapper.style.height = "";
    wrapper.style.position = "";
    wrapper.style.transform = "";
  }

  // 自动切换
  public toggle = (offsetProps = {}, usingPrevSets?: boolean) => {
    if (this.state.draggable) {
      this.fixedToStatic();
    }
    else {
      this.staticToFixed(offsetProps, usingPrevSets);
    }
  }

  // 窗口尺寸可能变化的情况下，重新计算坐标和尺寸
  private fixPositionAndSize = () => {
    const { size, translate } = this.state;

    let x = translate.x;
    let y = translate.y;
    let w = size.width;
    let h = size.height;

    if (w >= window.innerWidth) {
      w = window.innerWidth;
    }

    if (h >= window.innerHeight) {
      h = window.innerHeight;
    }

    if ((x + w) >= window.innerWidth) {
      x = window.innerWidth - w;
    }

    if ((y + h) >= window.innerHeight) {
      y = window.innerHeight - h;
    }

    this.setPosition(x, y);
    this.setSize(w, h);
  }

  /**
   * 获取当前指针位置
   * @param ev 触摸或鼠标事件
   * @returns 
   */
  private getPointerPosition = (ev: TouchEvent<HTMLElement> | MouseEvent<HTMLElement>) => {
    let x = 0;
    let y = 0;

    if ("touches" in ev) {
      x = ev.touches[0].clientX;
      y = ev.touches[0].clientY;
    }
    else {
      x = ev.clientX;
      y = ev.clientY;
    }

    return [x, y];
  }

  //
  // 绑定 Wrapper 操作
  //
  private wrapperMove = {
    /**
     * 初始化容器缩放功能
     */
    init: () => {
      const { wrapper, overlay } = this.obj;

      if (!wrapper || !overlay) return;

      wrapper.addEventListener(eventName.down, this.wrapperMove.onDown);
    },
    /**
     * 销毁容器拖拽功能
     */
    destroy: () => {
      const { wrapper, overlay } = this.obj;

      if (!wrapper || !overlay) return;

      wrapper.addEventListener(eventName.down, this.wrapperMove.onDown);
    },
    /**
     * 鼠标弹起
     * @description 释放事件
     */
    onUp: () => {
      const { wrapper, overlay } = this.obj;

      if (!wrapper || !overlay) return;

      wrapper.style.userSelect = "";
      overlay.classList.remove("active");

      document.removeEventListener(eventName.move, this.wrapperMove.onMove);
      document.removeEventListener(eventName.up, this.wrapperMove.onUp);
    },
    /**
     * 鼠标按下
     * @description 记录按下的位置
     */
    onDown: (e: unknown) => {
      const ev = e as TouchEvent<HTMLElement> | MouseEvent<HTMLElement>;

      const { wrapper, overlay } = this.obj;

      if (!wrapper || !overlay) return;

      if (!this.state.draggable) return;

      if (ev.target !== wrapper) return;

      ev.preventDefault();

      wrapper.style.userSelect = "none";
      overlay.classList.add("active");

      const [x, y] = this.getPointerPosition(ev);

      // 记录按下前鼠标的位置（减去容器坐标）
      this.state.location.x = x - this.state.translate.x;
      this.state.location.y = y - this.state.translate.y;

      document.addEventListener(eventName.move, this.wrapperMove.onMove);
      document.addEventListener(eventName.up, this.wrapperMove.onUp);
    },
    /**
     * 鼠标移动
     * @description 绑定事件
     */
    onMove: (e: unknown) => {
      const ev = e as TouchEvent<HTMLElement> | MouseEvent<HTMLElement>;

      const { wrapper } = this.obj;

      if (!wrapper) return;

      window.requestAnimationFrame(() => {
        // 移动的时候拿到的坐标是鼠标的（较大）减去按下前鼠标距离元素 xy 的距离
        let [x, y] = this.getPointerPosition(ev);

        x = x - this.state.location.x;
        y = y - this.state.location.y;

        if (x <= 0) {
          x = 0;
        }
        if (y <= 0) {
          y = 0;
        }

        const maxX = window.innerWidth - wrapper.clientWidth;
        const maxY = window.innerHeight - wrapper.clientHeight;

        if (x >= maxX) {
          x = maxX;
        }
        if (y >= maxY) {
          y = maxY;
        }

        this.setPosition(x, y);
      });
    }
  }

  //
  // 浏览器窗口调整检测
  //
  private windowResizeCheck = {
    onResizeFrame: () => {
      if (!this.obj.wrapper || !this.state.draggable) return;

      this.fixPositionAndSize();
    },
    onResize: () => {
      window.requestAnimationFrame(this.windowResizeCheck.onResizeFrame);
    },
    init: () => {
      window.addEventListener("resize", this.windowResizeCheck.onResize);
    },
    destroy: () => {
      window.removeEventListener("resize", this.windowResizeCheck.onResize);
    },
  }

  //
  // 拖拽功能（暂时只有右下角）
  //
  private wrapperResize = {
    size: {
      height: 0,
      width: 0,
    },
    position: {
      x: -1,
      y: -1,
    },
    pointer: {
      x: -1,
      y: -1,
    },
    direction: [] as (string | undefined)[],
    getDirection: (className: string) => {
      if (className.includes("-tl")) {
        return ["top", "left"];
      }
      if (className.includes("-tr")) {
        return ["top", "right"];
      }
      if (className.includes("-bl")) {
        return ["bottom", "left"];
      }
      if (className.includes("-br")) {
        return ["bottom", "right"];
      }

      if (className.includes("-t")) {
        return ["top"];
      }
      if (className.includes("-l")) {
        return [undefined, "left"];
      }
      if (className.includes("-b")) {
        return ["bottom"];
      }
      if (className.includes("-r")) {
        return [undefined, "right"];
      }

      return [];
    },
    checkIsPlus: (direction: (string | undefined)[]) => {
      if (direction[0] === "top" && direction[1] === "left") {
        return [false, false];
      }

      if (direction[0] === undefined && direction[1] === "left") {
        return [false, false];
      }

      if (direction[0] === "top" && direction[1] === undefined) {
        return [false, false];
      }

      if (direction[0] === "top" && direction[1] === "right") {
        return [true, false];
      }

      if (direction[0] === "bottom" && direction[1] === "left") {
        return [false, true];
      }

      // direction[0] !== "top", direction[1] !== "left"]
      return [true, true];
    },
    /**
     * 初始化缩放功能
     */
    init: () => {
      const { resizer } = this.obj;

      if (!resizer || !this.state.resizeable) {
        return;
      }

      resizer.innerHTML = `<span class="resizer-vertical resizer-t"></span>
        <span class="resizer-horizontal resizer-l"></span>
        <span class="resizer-vertical resizer-b"></span>
        <span class="resizer-horizontal resizer-r"></span>
        <span class="resizer-corner resizer-tl"></span>
        <span class="resizer-corner resizer-tr"></span>
        <span class="resizer-corner resizer-bl"></span>
        <span class="resizer-corner resizer-br"></span>
      `;

      resizer.addEventListener(eventName.down, this.wrapperResize.onDown);
    },
    /**
     * 销毁缩放功能
     */
    destroy: () => {
      const { resizer } = this.obj;

      if (!resizer || !this.state.resizeable) {
        return;
      }

      resizer.removeEventListener(eventName.down, this.wrapperResize.onDown);
    },
    /**
     * 鼠标弹起
     * @description 释放事件
     */
    onUp: () => {
      document.removeEventListener(eventName.up, this.wrapperResize.onUp);
      document.removeEventListener(eventName.move, this.wrapperResize.onMove);
    },
    /**
     * 鼠标按下
     * @description 记录按下的位置
     */
    onDown: (e: unknown) => {
      const ev = e as TouchEvent<HTMLElement> | MouseEvent<HTMLElement>;

      if (!this.obj.wrapper) {
        return;
      }

      ev.preventDefault();

      const self = this.wrapperResize;

      // 拖拽模式使用拖拽的高度
      if (this.state.draggable) {
        self.size.height = this.state.size.height;
        self.size.width = this.state.size.width;

        self.position.x = this.state.translate.x;
        self.position.y = this.state.translate.y;
      }
      // 获取实时高度
      else {
        self.size.height = this.obj.wrapper.offsetHeight;
        self.size.width = this.obj.wrapper.offsetWidth;
      }

      // 记录操作位置
      const target = ev.target as HTMLElement;
      self.direction = self.getDirection(target.className);

      // 记录按下前鼠标指针的位置
      const [x, y] = this.getPointerPosition(ev);
      self.pointer.x = x;
      self.pointer.y = y;

      document.addEventListener(eventName.up, this.wrapperResize.onUp);
      document.addEventListener(eventName.move, this.wrapperResize.onMove);
    },
    /**
     * 鼠标移动
     * @description 绑定事件
     */
    onMove: (e: unknown) => {
      const ev = e as TouchEvent<HTMLElement> | MouseEvent<HTMLElement>;

      window.requestAnimationFrame(() => {
        const { size, pointer, position, direction, checkIsPlus } = this.wrapperResize;

        // 获取偏差值
        const [x, y] = this.getPointerPosition(ev);

        const offsetX = direction[0] && !direction[1] ? 0 : x - pointer.x;
        const offsetY = direction[1] && !direction[0] ? 0 : y - pointer.y;

        // 根据触发拖拽位置计算宽高
        const isPlus = checkIsPlus(direction);
        let w = isPlus[0] ? size.width + offsetX : size.width - offsetX;
        let h = isPlus[1] ? size.height + offsetY : size.height - offsetY;

        // 检查溢出情况
        let maxW;
        let maxH;

        // 拖拽模式，需要判断容器坐标位置
        if (this.state.draggable) {
          const { translate } = this.state;

          maxW = window.innerWidth - translate.x;
          maxH = window.innerHeight - translate.y;
        }
        else {
          maxW = window.innerWidth;
          maxH = window.innerHeight;
        }

        if (w >= maxW) {
          w = maxW;
        }
        if (h >= maxH) {
          h = maxH;
        }

        // 反转操作，需要修改坐标位置
        if (this.state.draggable) {
          const posX = position.x + (isPlus[0] ? 0 : offsetX);
          const posY = position.y + (isPlus[1] ? 0 : offsetY);

          this.setPosition(posX, posY);
        }

        this.setSize(w, h);
      });
    }
  }
}
