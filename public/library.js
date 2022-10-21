async function loadLibrary(books)
{
    //console.log(books)
    var modString = '';

    for(i=0;i<books.length;i++)
    {
        if(books[i] == "," && books[i+1] == "{")
        {
            modString += 'SpLiT';
        }
        modString += books[i];
    }

    var bookArr = modString.split('SpLiT,');
    var objArr = [];

    
}