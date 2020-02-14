

document.querySelector("button").addEventListener("click", async e => {
    e.currentTarget.disabled = true;

    const dirName = 'demo';
    const response = await fetch(`http://localhost:3000/readFiles/${dirName}`);
    const json = await response.json();
    new FilesTree(document.querySelector('.folder-list1'), json, {showCount : false})
    new FilesTree(document.querySelector('.folder-list2'), json)
    new FilesTree(document.querySelector('.folder-list3'), json)
})



