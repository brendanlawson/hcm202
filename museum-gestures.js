// Separate tap recognition from OrbitControls: a drag or pinch is never a tap.
export function createTapGesture(threshold=6) {
  const pointers=new Set();let start=null,travel=0,multi=false;
  const reset=()=>{start=null;travel=0;multi=false};
  return {
    get active(){return pointers.size>0},
    down(e){pointers.add(e.pointerId);if(pointers.size===1){start={id:e.pointerId,x:e.clientX,y:e.clientY};travel=0;multi=false}else multi=true},
    move(e){if(start&&start.id===e.pointerId)travel=Math.max(travel,Math.hypot(e.clientX-start.x,e.clientY-start.y))},
    up(e){this.move(e);const tap=!!start&&start.id===e.pointerId&&!multi&&travel<threshold;pointers.delete(e.pointerId);if(!pointers.size)reset();return tap},
    cancel(e){pointers.delete(e.pointerId);multi=true;if(!pointers.size)reset()}
  };
}
