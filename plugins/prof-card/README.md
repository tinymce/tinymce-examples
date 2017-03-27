# Profile Card Plugin example

This is the repository for the Profile Card TinyMCE plugin example. See a demo of the plugin [here](https://dist-tdvebbnjpy.now.sh/).

In this readme I will go through step by step how I created this plugin and in the same time hopefully teach some basic uses of how to use the UI component of TinyMCE in your own plugins.

We will go through how to do the following things: 

* Create a toolbar button that is context aware and lights up when a profile card is selected
* Open a float panel on button click
* Adding input fields with corresponding labels to the float panel
* Use the data from the input fields in our plugin logic
* Insert data into the editor
* Edit already inserted profile cards 

After we have gone through all of this you will hopefully feel somewhat ready to try your hand at creating your own plugin for TinyMCE. 

*Let’s get started!*

### Prerequisites 
We are not going to build anything complicated during this article, if you have a working understanding of JavaScript you should be alright. 

I do however take for granted that you have node, NPM and Yeoman with the TinyMCE plugin generator (more on this in the next step) installed on your computer. 
Setting up
To make things as easy and fast as possible we will be using the TinyMCE plugin Yeoman generator during the creation of this plugin, so run the following command to make sure you have both installed:

```sh
npm install --global yeoman generator-tinymce
```

When that has finished installing you should be able to run `yo tinymce` in your terminal to start the generator. The generator will prompt you with a few different questions and then spit out a bootstrapped setup for us to quickly get started coding our plugin.

For this project I answered the prompts like this:

1. Plugin name?  
prof-card
2. How do you want to write your plugin?  
ES2015
3. Use yarn instead of npm?  
Yes
4. Skip git repo initialization?  
No
5. What’s your name?  
Well, I put my own name here but you just put in your own.
6. Your email?  
Skipped
7. Your website?  
Skipped
8. Which license do you want to use?  
MIT

After those have been answered the generator will create a directory for your plugin and install all the dependencies for you. When the install has finished we can cd into the directory, start the development server with `yarn run start` and start hacking away! 

### Creating files
To clean things up a bit we will start by creating two more files in the src directory, one called `Dialog.js` that holds the code concerning the popup dialog and its controls and one called `ProfileCard.js` that will contain the code that creates the profile card HTML string that will be added to the editor. 

Let’s start by going through the `ProfileCard.js` file.

### ProfileCard.js
```js
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
```

The file exports a simple function called `make` that takes three arguments and then returns a string of HTML, using the ES2015 template string to interpolate the values into the right places. A handy thing with template strings is that you can can do like I’ve done here and have a ternary expression inside of the template string to render different things depending on the value (an img tag if the img argument is truthy, otherwise an empty string).

To make things as easy as possible I’ve put the styling of the profile card as inline styles, which might not be pretty code to look at but it works.

What is more interesting to look at is the outermost div that both has the contenteditable attribute set to false, which will make it so you can’t click inside of it in the TinyMCE editor and edit the contents, but only select the whole div. The outermost div also has a data-prof-card attribute which is used as a target to see if a profile card has been selected (more on this later). 

Now that we’ve gone through this, let’s move on to the `plugin.js` file.

### Creating a toolbar button
Open up the generated `plugin.js` file and replace the code inside it with the following: 

```js
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
```

This file exports the plugin function that is used in the index.js file when the plugin is added to the TinyMCe PluginManager. It gets the editor instance as an argument. 

The interesting part here is the creation of the toolbar button with the call to `editor.addButton`, which takes an identifier string and an options object. The text and icon properties are what will be shown in the toolbar, we are only using the text here so we just set the icon to false. 

`stateSelector` is an option where you configure when the button should appear “active” by giving it an array of strings with css selectors. If the selection is on an element in the editor that matches one of the selectors in the array the button will appear active. 

Last but not least we have the `onclick` event callback that calls the Dialog.open function imported from the Dialog.js file, so let’s move on over to that file.

### Dialog.js
I will start by including the whole file and then go through it more thoroughly below. 

```js
import ProfileCard from './ProfileCard';

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
  const data = isEditing ? parseDataFromDiv(selectedNode) : {};

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
```

The important part of this file is the exported “open” function, which handles opening the popup window as well as takes care of the data entered into the input fields in the popup window. Let us start with the first few lines:

```js
const selectedNode = editor.selection.getNode();
const isEditing = selectedNode.hasAttribute('data-prof-card');
const data = isEditing ? parseDataFromDiv(selectedNode) : {};
```

We start by getting the selected node in the editor and then on the next line checking if the node has the data-proc-card attribute, which if it has means we have selected a profile card to edit. If we are editing an already existing profile card the data variable is filled with data that is very crudely parsed out from the node in the parseDataFromDiv function.

Following this comes the call to the editor.windowManager.open function that opens the popup window for us: 

```js
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
    editor.insertContent(profileHtml);    }
});
```

First we set a title and a minWidth to the popup window itself.

The body property defines the controls that will be inside of the window through an array of objects. The three controls we define are name, image and blurb. All three of them have the properties:

* name: the key on the data object where the controls input data will be added
* label: the text shown in the label next to the input field
* type: the type of control we want to render, all of them using the “textbox” control that corresponds to an input or textarea element
* value: lets us set a value into the control on render, here populated with the data variable we created above. If we have selected a profile card to edit the data will have been parsed into corresponding fields (the name on the data.name key and so on). If we are not editing a profile card but creating a new one the data object will be empty and the controls will be rendered without any values populated. 

Only the blurb object has two additional properties, namely multiline: true which tells TinyMCE to render a textarea instead of a single line input field, and the minHeight: 120 which sets the minimum height of the rendered textarea to give us some space to write in. 

After the body array we have the `onsubmit` function that gets called when we have entered our data into the popup window and pressed the OK button:

```js
onsubmit(e) {
  const { name, image, blurb } = e.data;
  const profileHtml = ProfileCard.make(name, image, blurb);
  editor.insertContent(profileHtml);
}
```

We first deconstruct the name, image and blurb strings from the data object on the event, then send these into the ProfileCard.make function that returns the HTML string. This HTML is then inserted into the editor. 

Wrapping up
That was pretty much it! Run the “yarn run build” script included by the yeoman generator to create a dist directory containing:

plugin.js - the bundled plugin
plugin.min.js - the bundled minified plugin
LICENSE - the license file

And you now have a production ready minified build to add to all of your apps using TinyMCE.

I hope you found this interesting, thank you for reading. 

