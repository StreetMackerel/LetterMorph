class Box {

  constructor(_x, _y, _size, _color) {
    this.x = _x;
    this.y = _y;
    this.size = _size;
    this.color = _color;
  }

  // Edges(){
  //   return (this.x+this.r > width || this.x - this.r < 0 || this.y+this.r > height || this.y - this.r < 0);
  // }

  Render() {
    fill(this.color);
    rect(this.x,this.y,this.size,this.size);
  }
}
