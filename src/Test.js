// Required for simjs to work
import { Sim } from 'simjs';
const SimJs = window.Sim;

export default class test extends SimJs.Entity {
     
    start() {
        console.log("the simulation has started!"); 
    }
}