const checkoutTemplate = destination => (`
<div class="checkout" xmlns="http://www.w3.org/1999/html">
    <div style="margin-bottom: 10px">
        <img style="width: 200px;
         height: 160px" 
         alt="cat" 
         src="https://res.cloudinary.com/travela-andela/image/upload/v1545297974/staging/cat.png"/>
    </div>
    <div style="width: 60%; 
        margin-left: 20%;
        margin-bottom: 20px">
        <span style="text-align: center;
            font-size: 15px; 
            color: #4F4F4F;
            line-height: 20px">
            It was great hosting you in ${destination} this past week. 
            We miss you already, please come back soon, please...
        </span>
    </div>
    <div style="padding: 10px">
        <img alt="phones" src="https://res.cloudinary.com/travela-andela/image/upload/v1545298027/staging/Rectangle_Copy_2.png" 
        style="width: 200px; 
        height: 180px; 
        object-position: center center; 
        object-fit: cover"/>
        <div 
            style="text-align: left; 
            vertical-align: top;
            display: inline-block; 
            width: 370px; 
            height: 180px; 
            background-color: #F8F8F8;">
            <h3 style="height: 23px;
                color: #4F4F4F; 
                font-size: 18px; 
                font-weight: bold; 
                line-height: 23px;">
                Phones and Mifi Devices
            </h3>
            <p style="height: 102px; 
                width: 329px;  
                font-size: 15px; 
                line-height: 20px;
                color: #4F4F4F; ">
                Very importantly, please return the access tag and mi-fi device 
                that was assigned to you on arrival before your departure.
            </p>
        </div>
        <br/>
    </div>
    <div>
        <div style="margin-top: 10px" >
            <span style="height: 25px;
                width: 109px;
                color: #4F4F4F;
                font-size: 18px;
                font-weight: bold;
                line-height: 23px;
                margin-bottom: 60px;">
                Guest Survey
            </span>
        </div>
        <div style="width: 80%; 
            margin-left: 10%;
            margin-bottom: 40px; 
            margin-top: 10px;">
            <span style= " width: 495px; 
                color: #4F4F4F; 
                font-size: 15px; 
                line-height: 20px; 
                text-align: center; 
                margin-left: 7%;">
                It's definitely been an exciting and lively time at ${destination}, 
                having you visit us. We appreciate the energy you brought with you. 
                I just have one ask: Please take some time to fill out 
                this survey to give us data on how we make 
                visits at Andela better going forward. It should take you less 
                than 10 minutes, so please share your thoughts with us. 
            </span>
        </div>
    </div>
</div>
`);
export default checkoutTemplate;
