const socket = io()
//elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages= document.querySelector('#messages');


//templates
const messageTemplate= document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room }= Qs.parse(location.search,{ignoreQueryPrefix : true})
const autoscroll = ()=>{
    //New Message element
    const $newMessage = $messages.lastElementChild
    
    //height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin =parseInt(newMessageStyles.marginBottom)
    const newMessagwHeight = $newMessage.offsetHeight + newMessageMargin;

   //visbile height
   const visibleHeight= $messages.offsetHeight;
   //height of messages container
   const containerHeight = $messages.scrollHeight;

   //How far I have scrolled
   const scrollOffset = $messages.scrollTop + visibleHeight

   if(containerHeight - newMessagwHeight <=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
   }
}

socket.on('message', (message) => {
    console.log(message);
    const html= Mustache.render(messageTemplate,{
        username: message.username,
        message : message.text,
        createdAt: moment(message.createdAt).format('h:m a')
    });
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('locationMessage',(url)=>{
    console.log(url);
    const html= Mustache.render(locationTemplate,{
        username: url.username,
        url ,
        createdAt : moment(url.createdAt).format('h:m a')
    });
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room, users})=>{
   const html= Mustache.render(sidebarTemplate,{
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled');
    //disable form

    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message,(error)=>{

        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value="";
        $messageFormInput.focus()

        //enable form

        if(error){
            return console.log(error);
        }
        console.log('Message delivered!');
    })
})

document.getElementById('send-location').addEventListener('click',()=>{

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser');
    }

    $sendLocationButton.setAttribute('disabled','disabled')
    //disable send location button is above code

    navigator.geolocation.getCurrentPosition((position)=>{
        const data = {
            latitude: position.coords.latitude,
            longitude : position.coords.longitude
        }
        socket.emit('sendLocation',data,(msg)=>{
            //enabling send location button
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared Successfully');
        })
    })
   
})

socket.emit('join',{username , room},(e)=>{
    if(e){
        alert(e);
        location.href='/'
    }
})

