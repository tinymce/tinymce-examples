import ProfileCard from './ProfileCard';

const removeIfExists = elm => elm && elm.parentNode.removeChild(elm);

const parseDataFromDiv = div => {
  const name = div.querySelector('h3').textContent;
  const blurb = div.querySelector('p').textContent;
  const image = div.querySelector('img');

  return {
    name,
    blurb,
    image: image ? image.src : null
  };
};

const open = (e, editor) => {
  const selectedNode = editor.selection.getNode();
  const isEditing = selectedNode.hasAttribute('data-prof-card');
  let data = isEditing ? parseDataFromDiv(selectedNode) : {};

  // Open window
  editor.windowManager.open({
    title: "Profile Card Maker",
    minWidth: 350,
    body: [
      {
        name: "name",
        label: "Name",
        type: "textbox",
        value: data.name
      }, {
        name: "image",
        label: "Image url (Optional)",
        type: "textbox",
        size: 40,
        value: data.image
      }, {
        name: "blurb",
        label: "Blurb",
        type: "textbox",
        multiline: true,
        minHeight: 120,
        value: data.blurb
      }
    ],
    onsubmit(e) {
      const { name, image, blurb } = e.data;
      const profileHtml = ProfileCard.make(name, image, blurb);
      editor.insertContent(profileHtml);
    }
  });
};

export default {
  open
};