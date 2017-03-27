const make = (name, img, blurb) => {
  return `<div contenteditable="false" style="width: 200px;" data-prof-card="1" >
    <div style="border: 1px solid #9e9e9e; border-radius: 5px; padding: 5px;">
      <div style="text-align: center; margin: 10px;">
        ${img ? `<img style="border-radius: 100%; width: 100px; height: 100px; display: inline-block;" src="${img}" alt="">` : ''}
        <h3>${name}</h3>
        <hr style="width: 100px; border: 2px solid #9e9e9e;">
      </div>
      <div style="margin: 10px;">
        <p>
          ${blurb}
        </p>
      </div>
    </div>
  </div>`;
};

export default {
  make
};
