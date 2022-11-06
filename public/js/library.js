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

modals = document.getElementsByClassName('modal');

function modal(book)
{
    const modal = document.getElementById("modal-"+book);

    modal.style.display = "block";
}

function closeModal(book)
{
    const modal = document.getElementById("modal-"+book);

    modal.style.display = "none";

}

window.onclick = function(e){
    for(i=0;i<modals.length;i++)
    {
        if(e.target == modals[i])
        {
            modals[i].style.display = "none";
        }
    }
}

document.onkeyup = function(e){
    if(e.key === 'Escape')
    {
        for(i=0;i<modals.length;i++)
        {
            if(modals[i].style.display == "block")
            {
                modals[i].style.display = "none";
            }
        }
    }
}