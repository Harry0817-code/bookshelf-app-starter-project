
// Bagian fungsi welcome (Pertama kali dibuka)
function welcome() {
    var name = prompt("mohon isi nama anda :","");
    clickbuttoncancel(name);
    var n = name.length;

    if (n < 1) {
        promptempty();
    }
    else {
        document.getElementById('username').innerHTML = name;
    }
    document.body.removeAttribute('hidden');
}

function clickbuttoncancel(checkname) {
    if (checkname === null) {
        if (confirm("Apakah Anda yakin ingin menutup halaman ini?")) {
            window.close();
        }
        else {
            welcome();
        }
    }
}

function promptempty(){
    var name = prompt("nama tidak boleh kosong, mohon diisi :","");
    clickbuttoncancel(name);
    var n = name.length;

    if (n < 1) {
        promptempty();
    }
    else {
        document.getElementById('name').innerHTML = name;
    }
}

document.body.onload = welcome;

// untuk checkbox apakah buku sudah selesai dibaca atau belum
document.getElementById('bookFormIsComplete').addEventListener('change', function () {
    const isComplete = document.getElementById('bookFormIsComplete');
    if (isComplete.checked) {
        document.getElementById('checkBoxBookIsComplete').innerHTML = 'Selesai Dibaca';
    } else {
        document.getElementById('checkBoxBookIsComplete').innerHTML = 'Belum Selesai Dibaca';
    }
});

// Bagian fungsi isi konten (Setelah website dibuka)
document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

const books = [];
const RENDER_EVENT = 'render-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
const SAVED_EVENT = 'saved-book';

function addBook() {
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = document.getElementById('bookFormYear').value;
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    const book = {
        id: +new Date(),
        title,
        author,
        year,
        isComplete
    };

    books.push(book);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById('incompleteBookList');
    const completedBookList = document.getElementById('completeBookList');
    uncompletedBookList.innerHTML = '';
    completedBookList.innerHTML = '';
    for (const book of books) {
        // Elemen utama
        const bookElement = document.createElement('div');
        bookElement.setAttribute('data-bookid', book.id);
        bookElement.setAttribute('data-testid', 'bookItem');

        // Elemen judul buku
        const titleElement = document.createElement('h3');
        titleElement.setAttribute('data-testid', 'bookItemTitle');
        titleElement.innerText = 'Judul Buku ' + book.title;

        // Elemen penulis buku
        const authorElement = document.createElement('p');
        authorElement.setAttribute('data-testid', 'bookItemAuthor');
        authorElement.innerText = 'Penulis: ' + book.author;

        // Elemen tahun buku
        const yearElement = document.createElement('p');
        yearElement.setAttribute('data-testid', 'bookItemYear');
        yearElement.innerText = 'Tahun: ' + book.year;

        // Elemen button
        const buttonContainer = document.createElement('div');
        if (book.isComplete) {
            const uncompleteButton = document.createElement('button');
            uncompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
            uncompleteButton.setAttribute('style', 'margin-right: 10px;');
            uncompleteButton.innerText = 'Belum Selesai Dibaca';
            uncompleteButton.addEventListener('click', function () {
                undoBookFromCompleted(book.id);
            });
            buttonContainer.append(uncompleteButton);
        } else {
            const completeButton = document.createElement('button');
            completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
            completeButton.setAttribute('style', 'margin-right: 10px;');
            completeButton.innerText = 'Selesai Dibaca';
            completeButton.addEventListener('click', function () {
                addBookToCompleted(book.id);
            });
            buttonContainer.append(completeButton);
        }

        // Button Hapus
        const deleteButton = document.createElement('button');
        deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
        deleteButton.setAttribute('style', 'margin-right: 10px;');
        deleteButton.innerText = 'Hapus Buku';
        deleteButton.addEventListener('click', function () {
            removeBook(book.id);
        });
        buttonContainer.append(deleteButton);

        // Button Edit
        const editButton = document.createElement('button');
        editButton.setAttribute('data-testid', 'bookItemEditButton');
        editButton.innerText = 'Edit Buku';
        editButton.addEventListener('click', function () {
            editBook(book.id);
        });
        buttonContainer.append(editButton);

        bookElement.append(titleElement, authorElement, yearElement, buttonContainer);

        if (book.isComplete) {
            completedBookList.append(bookElement);
        } else {
            uncompletedBookList.append(bookElement);
        }
    }
});

function addBookToCompleted(bookId) {
    const book = books.find((book) => book.id === bookId);
    if (book) {
        book.isComplete = true;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function undoBookFromCompleted(bookId) {
    const book = books.find((book) => book.id === bookId);
    if (book) {
        book.isComplete = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function removeBook(bookId) {
    const bookIndex = books.findIndex((book) => book.id === bookId);
    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function editBook(bookId) {
    const book = books.find((book) => book.id === bookId);
    if (book) {
        document.getElementById('bookFormTitle').value = book.title;
        document.getElementById('bookFormAuthor').value = book.author;
        document.getElementById('bookFormYear').value = book.year;
        document.getElementById('bookFormIsComplete').checked = book.isComplete;

        removeBook(bookId);
    }
}

function disableAllButtonEdit() {
    const button = document.getElementById('bookItemEditButton');
    button.setAttribute('disabled', 'true');
}

function disableButtonEditAndChangeNameButton() {
    const button = document.getElementById('submitButton');
    button.innerText = 'Simpan Perubahan';
    button.setAttribute('onclick', 'saveChanges()');
}

function disableButton() {
    const button = document.getElementById('submitButton');
    button.setAttribute('disabled', 'true');
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Browser tidak mendukung local storage');
        return false;
    }
    return true;
}
