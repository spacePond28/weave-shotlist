// Drag and drop functionality 
const Sortable = require('sortablejs');

const shotListTable = document.getElementById('shotListTable');
Sortable.create(shotListTable, {
    animation: 150,
    onEnd: function (evt) {
        // Logic to update the order in the database
        console.log('Item moved from', evt.oldIndex, 'to', evt.newIndex);
    }
});
