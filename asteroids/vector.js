class vector {

    static zero = new vector(0, 0);

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static randomUnit() {
        let x = Math.random() * 2 - 1;
        let y = Math.random() * 2 - 1;
        return new vector(x, y);
    }

    static fromAngle(a = 0, r = 1) {
        let x = Math.cos(a) * r;
        let y = Math.sin(a) * r;
        return new vector(x, y);
    }

    static copy(v) {
        return new vector(v.x, v.y);
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
    }

    mul(s) {
        this.x *= s;
        this.y *= s;
    }

    div(s) {
        this.x /= s;
        this.y /= s;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    normalise() {
        let l = this.length();
        if (l == 0)
            this.zero()
        else
            this.div(this.length());
    }

    normalised() {
        let l = this.length();
        if (l == 0)
            return new vector(0, 0);
        else
            return new vector(this.x / l, this.y / l);
    }

    right() {
        return new vector(-this.y, this.x)
    }

    left() {
        return new vector(this.y, -this.x)
    }

    zero() {
        this.x = 0;
        this.y = 0;
    }
}