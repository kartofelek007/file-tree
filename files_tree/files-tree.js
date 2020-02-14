class FilesTree {
    /**
     * Start generate list
     * @param cnt - element in html to put generated list
     * @param filesTree - json with list structure
     */
    constructor(cnt, json, options) {
        this.json = json;
        this.cnt = cnt;
        this.options = Object.assign({}, {
            showCount : true
        }, options);

        this.mainUL = this.generateRecursiveUL(this.json, false, true);
        this.cnt.appendChild(this.mainUL);

        this.hideUnusedToggleAndCount();
        this.bindFileCheckbox();
        this.bindFolderCheckbox();
        this.bindTreeToggle();

        //po wygenerowaniu listy sprawdzam stan checkboxow folderów
        this.cnt.querySelectorAll(`.files-tree-file-checkbox:checked`).forEach(input => {
            this.checkCheckboxesOnCurrentNode(input)
        });
    }

    /**
     * Recursive generate list with files
     * @param json - json object with list structure
     * @param defaultVisible - if list is default visible
     * @param mainList - is this list is top level list
     * @returns {Element}
     */
    generateRecursiveUL(json, defaultVisible = false, mainList = false) {
        const ul = document.createElement("ul");

        if (mainList) {
            ul.classList.add("files-tree");
        } else {
            ul.classList.add("files-tree-sublist");
        }

        if (defaultVisible) {
            ul.classList.add("is-show");
            ul.setAttribute('aria-expanded', true);
        } else {
            ul.setAttribute('aria-expanded', false);
        }

        for (const [key, element] of Object.entries(json)) {
            const li = document.createElement("li");
            li.classList.add("files-tree-li");

            let checked = "";
            if (element.checked) {
                checked = `checked`
            }

            if (element.type === "file") {
                li.classList.add("files-tree-li-file");

                let fileExtClass = "";
                if (element.ext) {
                    fileExtClass = `is-${element.ext}`;
                }

                li.innerHTML = `
                    <div class="files-tree-file-cnt">
                        <label class="files-tree-label files-tree-file-label">
                            <span class="files-tree-checkbox-cnt">
                                <input name="${element.id}" ${checked} type="checkbox" class="files-tree-checkbox files-tree-file-checkbox" />
                            </span>
                            <span class="files-tree-file-icon ${fileExtClass}">
                            </span>
                            <span class="files-tree-name files-tree-file-name" title="${element.path}">${element.name}</span>
                        </label>
                    </div>
                `;

            } else if (element.type === "folder") {
                li.classList.add("files-tree-li-folder");
                li.innerHTML = `
                    <div class="files-tree-folder-cnt">
                        <button type="button" class="files-tree-toggle ${element.show?'is-show':''}">
                            <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="57" height="57" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                            </span>
                        </button>
                        <label class="files-tree-label files-tree-folder-label">
                            <span class="files-tree-checkbox-cnt">
                                <input name="${element.id}" ${checked} type="checkbox" class="files-tree-checkbox files-tree-folder-checkbox" />
                            </span>
                            <span class="files-tree-folder-icon ${element.show?'is-open':''}">
                            </span>
                            <span class="files-tree-name files-tree-folder-name" title="${element.path}">${element.name}</span>
                            ${this.options.showCount ? `<span class="files-tree-count">0</span>` : ``}
                        </label>
                    </div>
                `;

                const subList = this.generateRecursiveUL(element.files, element.show);
                li.appendChild(subList);
            }
            ul.appendChild(li);
        }

        return ul;
    }

    /**
    * Hide folder-checkbox and toggle button in empty list
    */
    hideUnusedToggleAndCount() {
        const toggle = this.cnt.querySelectorAll(".files-tree-toggle");

        toggle.forEach(toggle => {
            const ul = toggle.parentElement.nextElementSibling;
            const checkbox = ul.querySelector(`input[type="checkbox"]`);

            if (checkbox === null) {
                if (this.options.showCount) {
                    const count = toggle.nextElementSibling.querySelector('.files-tree-count');
                    count.remove();
                }

                const span1 = document.createElement("span");
                span1.classList.add("files-tree-toggle-empty");
                toggle.parentElement.insertBefore(span1, toggle);
                toggle.remove();
            }
        })
    }

    /**
     * Set folder checkbox only in current list to checked/indeterminate/unchecked based on children checkbox count
     * @param ul - list to check
     */
    markFolderCheckbox(ul) {
        const checkboxes = [...ul.children].map(el => el.querySelector("div").querySelector(`input[type="checkbox"]`));

        if (checkboxes.length !== 0 && ul.previousElementSibling) {
            const chkFolder = ul.previousElementSibling.querySelector(".files-tree-folder-checkbox");
            const chkChecked = checkboxes.filter(el => el.checked);
            const chkUnchecked = checkboxes.filter(el => !el.checked && !el.indeterminate);

            chkFolder.checked = (checkboxes.length === chkChecked.length);
            chkFolder.indeterminate = checkboxes.length !== chkChecked.length && chkUnchecked.length !== checkboxes.length;
            chkFolder.setAttribute('indeterminate', chkFolder.indeterminate);
        }
    }

    /**
     * Return checkbox:checked count in list and sublist
     * @param ul
     * @returns {Number}
     */
    calculateCheckedCheckboxCount(ul) {
        return [...ul.querySelectorAll(`input[type="checkbox"]:not(.files-tree-folder-checkbox)`)].filter(el => el.checked).length
    }

    /**
     * Return parents list
     * @param el - from which element starts going up in tree
     * @returns {Array}
     */
    getParentsUL(el) {
        const ul = [];
        let parent = el.parentElement;

        while (true) {
            if (parent !== this.mainUL) {
                if (parent.tagName.toLowerCase() === "ul") {
                    ul.push(parent);
                }
                parent = parent.parentElement;
            } else {
                break;
            }
        }

        return ul;
    }

    /**
     * Set folder checkbox based on checkboxes in current list and sublist
     * @param element - element from which he starts checking
     */
    checkCheckboxesOnCurrentNode(element) {
        const ulParent = this.getParentsUL(element);
        let grandUL = null;
        if (ulParent.length === 0) {
            grandUL = element.closest('.files-tree-folder-cnt').nextElementSibling;
        } else {
            grandUL = ulParent[ulParent.length - 1];
        }
        const li = grandUL.closest('.files-tree-li');
        const sublist = [...li.querySelectorAll('.files-tree-sublist')].reverse();

        sublist.forEach(ul => {
            if (ul.previousElementSibling) {
                if (this.options.showCount) {
                    const countEl = ul.previousElementSibling.querySelector(".files-tree-count")
                    if (countEl !== null) {
                        countEl.innerHTML = this.calculateCheckedCheckboxCount(ul);
                    }
                }
                this.markFolderCheckbox(ul);
            }
        })
    }

    /**
     * Bind all folder checkbox
     */
    bindFolderCheckbox() {
        const folderChk = this.cnt.querySelectorAll(`.files-tree-folder-checkbox`);
        for (const el of folderChk) {
            el.addEventListener("click", e => {
                //po klinięciu na checkbox
                //zaznaczam w danej liście i podlistach wszystkie checkboxy
                //na checked lub unchecked
                const ul = e.target.closest(".files-tree-folder-cnt").nextElementSibling;
                const chk = ul.querySelectorAll(`input[type="checkbox"]`);
                const checked = e.target.checked;
                chk.forEach(el => {
                    if (el.classList.contains("files-tree-folder-checkbox")) {
                        el.indeterminate = false;
                    }
                    el.checked = checked
                });
                this.markFolderCheckbox(e.target.closest("ul"));

                //po zaznaczeniu checkboxów w danej liście
                //musze przejść do najwyższej listy w danym rozgałęzieniu
                //a następnie robiąc pętlę po podlistach tej listy
                //spradzić każdą czy ma mieć stan checkboxa checked/indeterminate/unchecked
                this.checkCheckboxesOnCurrentNode(e.target);

            });
        }
    }

    /**
     * Bind all files checkboxes
     */
    bindFileCheckbox() {
        const chk = this.cnt.querySelectorAll(".files-tree-file-checkbox");
        for (const el of chk) {
            el.addEventListener("click", e => {
                const ul = this.getParentsUL(e.target);
                ul.forEach(ul => this.markFolderCheckbox(ul));

                if (this.options.showCount) {
                    ul.forEach(ul => {
                        const countEl = ul.previousElementSibling.querySelector(".files-tree-count")
                        countEl.innerHTML = this.calculateCheckedCheckboxCount(ul);
                    })
                }
            });
        }
    }

    /**
     * Show/hide sublist (one level down)
     */
    bindTreeToggle() {
        const btns = this.cnt.querySelectorAll(".files-tree-toggle");
        for (const el of btns) {
            el.addEventListener("click", e => {
                e.currentTarget.classList.toggle('is-show');
                e.currentTarget.nextElementSibling.querySelector('.files-tree-folder-icon').classList.toggle('is-open');
                const ul = e.currentTarget.parentElement.nextElementSibling;
                ul.classList.toggle("is-show")
                ul.setAttribute('aria-expanded', ul.classList.contains("is-show"))
            })
        }
    }
}