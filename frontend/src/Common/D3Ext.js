const d3 = window.d3;

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.position = function() {
    let el = this.node();
    let elPos = el.getBoundingClientRect();
    let vpPos = getVpPos(el);

    function getVpPos(el) {
        if (el.parentElement.tagName === 'svg') {
            return el.parentElement.getBoundingClientRect();
        }
        return getVpPos(el.parentElement);
    }

    return {
        x: (elPos.left + elPos.right) / 2 - vpPos.left,
        y: (elPos.top + elPos.bottom) / 2 - vpPos.top,
        top: elPos.top - vpPos.top,
        left: elPos.left - vpPos.left,
        width: elPos.width,
        bottom: elPos.bottom - vpPos.top,
        height: elPos.height,
        right: elPos.right - vpPos.left
    };
};

export default d3;
