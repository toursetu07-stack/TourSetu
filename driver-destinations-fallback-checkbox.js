/* Independent destination-list fallback: no imports or Supabase dependency. */
(function(){
 var destinations=["Kedarnath Temple","Badrinath Temple","Gangotri Temple","Yamunotri Temple","Tungnath Temple","Rudranath Temple","Madhyamaheshwar Temple","Kalpeshwar Temple","Hemkund Sahib","Jageshwar Dham","Patal Bhuvaneshwar","Neelkanth Mahadev Temple","Dhari Devi Temple","Surkanda Devi Temple","Chitai Golu Devta Temple","Mansa Devi Temple (Haridwar)","Chandi Devi Temple (Haridwar)","Kainchi Dham","Baijnath Temple (Bageshwar)","Katarmal Sun Temple","Narsingh Temple (Joshimath)"];
 var list=document.getElementById('vehicle-tour-destination-list');
 if(!list||list.querySelector('input[name="vehicle-tour-destination"]'))return;
 list.replaceChildren();
 destinations.forEach(function(name){
  var label=document.createElement('label');label.className='destination-option';
  var input=document.createElement('input');input.type='checkbox';input.name='vehicle-tour-destination';input.value=name;
  var span=document.createElement('span');span.textContent=name;
  label.append(input,span);list.append(label);
 });
 list.dataset.renderedCount=String(destinations.length);
})();
