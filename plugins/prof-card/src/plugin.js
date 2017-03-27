import Dialog from './Dialog';

const plugin = (editor) => {
  editor.addButton("profCard", {
    text: "Profile Card",
    icon: false,
    stateSelector: ['div[data-prof-card]'],
    onclick: e => Dialog.open(e, editor)
  });
};

export default plugin;
