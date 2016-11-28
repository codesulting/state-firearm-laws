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



/* for displaying Tableau table */
var divElement2 = document.getElementById('viz1480296125463');
var vizElement2 = divElement2.getElementsByTagName('object')[0];
vizElement2.style.minWidth = '100%';
/*
vizElement.style.minWidth='424px';
 vizElement.style.maxWidth='100%';
 */
vizElement2.style.minHeight='629px';
//vizElement.style.maxHeight=(divElement.offsetWidth*0.75)+'px';
var scriptElement2 = document.createElement('script');
scriptElement2.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
vizElement2.parentNode.insertBefore(scriptElement2, vizElement2);
