/* for displaying Tableau map */

var divElement = document.getElementById('viz1479078600664');
var vizElement = divElement.getElementsByTagName('object')[0];
vizElement.style.minWidth = '100%';
/*
vizElement.style.maxHeight = (divElement.offsetWidth * 0.75) + 'px';
vizElement.style.minWidth = '424px';
vizElement.style.maxWidth = '100%';
*/
vizElement.style.minHeight = '629px';
// vizElement.style.maxHeight = (divElement.offsetWidth * 0.75) + 'px';
var scriptElement = document.createElement('script');
scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
vizElement.parentNode.insertBefore(scriptElement, vizElement);
