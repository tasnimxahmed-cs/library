async function getBook(id)
{
    document.getElementById("error").innerHTML = '';
    var title;
    var author;
    var pbd;
    var pg;
    var pb;
    var isbnth;
    var isbnt;

    isbnNum = document.getElementById("isbn").value
    if((isbnNum.length <1 || isbnNum.length >13) || (isNaN(parseInt(isbnNum))))
    {
        document.getElementById("error").innerHTML = 'Please enter a proper ISBN number!';
        document.getElementById("isbn").value = '';
        document.getElementById("isbn").focus();
        $('#results').html("");
        return;
    }
    endpoint="https://openlibrary.org/isbn/"+isbnNum+".json"
    const data = await fetch(endpoint);
    if(data.status == 404)
    {
        document.getElementById("error").innerHTML = 'Book not found!';
        document.getElementById("isbn").value = '';
        document.getElementById("isbn").focus();
        $('#results').html("");
        return;
    }
    const json = await data.json();

    if(json.title != undefined) title = json.title;
    else title = "Title Not Found";

    if(json.authors != undefined)
    {
        const data1 = await fetch(`http://openlibrary.org${json.authors[0].key}.json`)
        const json1 = await data1.json();
        author = json1.name;
    }
    else author = "Author Not Found";

    if(json.publish_date != undefined) pbd = json.publish_date;
    else pbd = "Publish Date Not Found";

    if(json.number_of_pages != undefined) pg = json.number_of_pages;
    else pg = "Number of Pages Not Found";

    if(json.publishers != undefined) pb = json.publishers[0];
    else pb = "Publishers Not Found";

    if(json.isbn_13 != undefined) isbnth = json.isbn_13;
    else isbnth = "ISBN13 Not Found";

    if(json.isbn_10 != undefined) isbnt = json.isbn_10;
    else isbnt = "ISBN10 Not Found";  

    if(json.description != undefined)
    {
        if(typeof(json.description) == "object") description = json.description.value;
        else description = json.description;
    }
    else description = 'Description Not Found';

    $('#results').html(`<hr style="width: 100vw; border-top: 2px solid rgba(184,216,190,1);">
    <div class="result">
        <div class="left">
            <img src="https://covers.openlibrary.org/b/isbn/${isbnNum}-M.jpg" alt="" />
            <form action="/deleteBook" method="POST">
            <input type="hidden" id="isbnth" name="isbnth" value="${isbnth}">
            <button type="submit">Delete From Library</button>
            </form>
        </div>
        <div class="right">
            <h3 id="title">${title}</h3>
            <p id="author">${author}</p>
            <p id="year" style="display: inline;">${pbd}</p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<p id="pages" style="display: inline;">${pg} Pages</p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<p id="publisher" style="display: inline;">(${pb})</p><br><br>
            <p id="isbn13" style="display: inline;">ISBN-13: ${isbnth}</p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<p id="isbn10" style="display: inline;">ISBN-10: ${isbnt}</p>
            <p id="description">${description}</p>
        </div>
    </div>`);

    document.getElementById("isbn").value = '';
    document.getElementById("isbn").focus();
}