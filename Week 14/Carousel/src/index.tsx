import * as ReflectDOM from "./ReflectDOM";

interface CarouselProps {
  src: string[];
}

class Carousel extends ReflectDOM.Component<CarouselProps> {
  currentIndex: number = 0;
  constructor(props: CarouselProps, children: null) {
    super(props, children);

    this.bindEvents();

    setInterval(() => {
      this.currentIndex = this.getCircleIndex(this.currentIndex + 1);
      this.update();
    }, 5 * 1000);
  }

  getCircleIndex(index: number) {
    const count = this.props.src.length;
    return (index + count) % count;
  }

  update = () => {
    [...this.root.childNodes].map((node, idx) => {
      (node as HTMLElement).classList.toggle(
        "current",
        idx === this.currentIndex
      );
      (node as HTMLElement).classList.toggle(
        "prev",
        idx === this.getCircleIndex(this.currentIndex - 1)
      );
      (node as HTMLElement).classList.toggle(
        "next",
        idx === this.getCircleIndex(this.currentIndex + 1)
      );
    });
  };

  bindEvents = () => {
    (this.root as HTMLElement).addEventListener("mousedown", (e) => {
      const startX = e.clientX;
      const up = (ev) => {
        const endX = ev.clientX;

        this.currentIndex = this.getCircleIndex(
          this.currentIndex + Math.sign(startX - endX) * 1
        );
        this.update();
        document.removeEventListener("mouseup", up);
      };

      document.addEventListener("mouseup", up);
    });
  };

  render() {
    return (
      <div class="carousel">
        {this.props.src.map((src) => (
          <div
            class="slide"
            style={{
              backgroundImage: `url('${src}')`,
              backgroundSize: "cover",
            }}
          />
        ))}
      </div>
    );
  }
}

ReflectDOM.render(
  <Carousel
    src={[
      "/images/pexels-alexander-kovalev-1818610.jpg",
      "/images/pexels-bearmax-3960036.jpg",
      "/images/pexels-bearmax-3960037.jpg",
      "/images/pexels-koustabh-biswas-3737179.jpg",
      "/images/pexels-natalia-hutak-4072639.jpg",
    ]}
  />,
  document.getElementById("app")
);
