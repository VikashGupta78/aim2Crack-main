import React,{useState} from 'react'
import './error.css';
// import imageSrc from '../assets/images/user/undraw_cancel_u1it.svg';
import imageSrc from '../../assets/images/user/Logo enlarged-03.png';
const Error =()=>{
     return(
      <div id="error">
           {/* <img src={imageSrc} alt="error" id="error1"/> */}
           <div class="error2">

           <h2>
               ERROR 403 :(
           </h2>
           <div class="error3">
           <p>Go Back To Aim2Crack</p>
           <a href="https://aim2crack.in/" ></a>
           </div>
           </div>
      </div>
    )
}
export default Error;