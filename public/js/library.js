function filter(letter)
{
    const prev = document.getElementsByClassName("letter-active")[0];
    prev.classList.toggle("letter");
    prev.classList.toggle("letter-active");
    thisElem = document.getElementById(letter)
    thisElem.classList.toggle("letter");
    thisElem.classList.toggle("letter-active");
    const books = document.getElementsByClassName('book');
    if(letter == "all")
    {
        for(i=0;i<books.length;i++)
        {
            books[i].style.display = "inline-block";
        }
        return;
    }
    for(i=0;i<books.length;i++)
    {
        if(books[i].children[1].outerText.toLowerCase().charAt(0) != letter) books[i].style.display = "none";
        else books[i].style.display = "inline-block";
    }
}