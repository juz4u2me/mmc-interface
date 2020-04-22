import React, {Component} from "react";
import './toolbar.css';

// Material-UI
import { TextField, Button, ButtonGroup } from '@material-ui/core';

// Required for simjs to work
import { Sim } from 'simjs';
const SimJs = window.Sim;


export default class Toolbar extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount = () => {

    }

    mmc = () => {
        let lambda = 1.0/parseFloat(document.getElementById("lambda").value);
        let mu = 1.0/parseFloat(document.getElementById("mu").value);
        let nservers = parseInt(document.getElementById("nservers").value);
        let simtime = parseFloat(document.getElementById("simtime").value);
        let seed = 2886;

        var sim = new SimJs.Sim();
        var server = new SimJs.Facility('server', SimJs.Facility.FCFS, nservers);
        var rand = new SimJs.Random((typeof seed !== 'undefined') ? seed : 12345);
        class Generator extends SimJs.Entity {
          start() {
            this.useFacility(server, rand.exponential(mu));
            this.setTimer(rand.exponential(lambda)).done(this.start);
          }
        };
      
        sim.addEntity(Generator);
        sim.simulate((simtime !== undefined) ? simtime : 20000);
        server.finalize(sim.time());
      
        /** Expected results */
        var rho = lambda / mu;
        var Expected = {
          // Expected number of users in system
          N: rho / (1.0 - rho),
          // Variance of number of users in system
          S: rho / ( (1 - rho) * (1 - rho)),
      
          // Expected number of requests in the server
          Ns: rho,
          // Expected number of requests in the queue
          Nq: rho * rho / (1 - rho),
      
          // Total expected waiting time (queue + service)
          T: 1.0 / (mu - lambda),
          // Expected waiting time in queue
          W: rho / (mu - lambda)
        };
      
        /** Obtained results */
        var Obtained = {
          N: server.systemStats().sizeSeries.average(),
          S: server.systemStats().sizeSeries.variance(),
          Ns: server.usage() / sim.time(),
          Nq: server.queueStats().sizeSeries.average(),
          T: server.systemStats().durationSeries.average(),
          W: server.queueStats().durationSeries.average()
        };
      
        console.log("M/M/c Simulation (lambda=" + lambda + ", mu=" + mu + ", c=" + nservers + ")\n");
        var fields = ['N', 'S', 'Ns', 'Nq', 'T', 'W'];
        for (var field in fields) {
          var name = fields[field];
          console.log(name
              + ": Expected = " + Expected[name].toFixed(2)
              + "   Obtained = " + Obtained[name].toFixed(2)
              + "\n");
        }

        document.getElementById("N").value = Obtained['N'].toFixed(2);
        document.getElementById("Nq").value = Obtained['Nq'].toFixed(2);
        document.getElementById("T").value = Obtained['T'].toFixed(2);
        document.getElementById("W").value = Obtained['W'].toFixed(2);
    }

    render() {

        return (
            <div className="controls">
                <br></br>
                <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
                    <TextField id="nservers" label="No. of servers" type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined" />
                    <TextField id="lambda" label="Inter-arrival time (min)" type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined" />
                    <TextField id="mu" label="Service time (min)" type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined" />
                    <TextField id="simtime" label="Simulation time (min)" type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined" />
                    <Button variant="contained" color="primary" onClick={this.mmc}>Simulate</Button>
                </ButtonGroup><br></br>
                <TextField id="N" label="Expected no. of users" type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined" /><br></br>
                <TextField id="Nq" label="Expected no. of users in queue" type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined" /><br></br>
                <TextField id="T" label="Total expected waiting time (queue + service) (min)" type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined" /><br></br>
                <TextField id="W" label="Expected waiting time in queue (min)" type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined" />
            </div>
        );
    }
}

