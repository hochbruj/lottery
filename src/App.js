import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import lottery from './lottery';
import { Form, Button, Message, Input, Container } from 'semantic-ui-react';

class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    errmessage: '',
    sucmessage:'',
    winmessage:'',
    loading: false,
    winloading: false,
    account: ''
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    const accounts = await web3.eth.getAccounts();
       
    this.setState({ manager, players, balance, account: accounts[0] });
  }

  onSubmit = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({sucmessage: 'Please wait until transction is confirmed...',
                  errmessage: '',
                   loading: true } );
    
    try {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });
   
    this.setState({sucmessage: 'You have been entered!'});

    } catch (err) {
    this.setState({ errmessage: err.message, sucmessage: '' })

    }

    this.setState({ loading: false});

  }

  onClick = async () => { 
    const accounts = await web3.eth.getAccounts();

    this.setState({winloading: true});
    
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });
   
    this.setState({ winmessage: 'Winner has been picked!', winloading: false });


  };
  
  render() {
    const ableToPickWinner = (this.state.manager === this.state.account);

    return (
      <Container>
      <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"></link>
       <h2>Ether Lottery</h2>
       <p>This contract is managed by {this.state.manager}.
          There are currently {this.state.players.length} people entered,
          competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether! </p>
         
       <hr />

       <Form onSubmit={this.onSubmit}
             error={!!this.state.errmessage}
             success={!!this.state.sucmessage}
             >
         <h4>Want to try your luck?</h4>
         <Form.Field>
           <label>Amount to enter</label>
           <Input
            value={this.state.value}
            onChange={ event => this.setState({ value: event.target.value }) }
            label="either"
            labelPosition="right"
           />
         </Form.Field>
         <Message error header="Oops!" content={this.state.errmessage} />
         <Message success header="Success!" content={this.state.sucmessage} />
         <Button primary loading={this.state.loading}>Enter now!</Button>
       </Form>

       <hr />

       <h4>Ready to pick a winner? Can only be done by manager.</h4>

       <Button 
          color="teal"
          onClick={this.onClick}
          loading={this.state.winloading}
          disabled={!ableToPickWinner}>
          Pick a Winner
        </Button>
       <Message
          success
          hidden={!this.state.winmessage}
          header="Success!"
          content={this.state.winmessage}/>

       <hr />
    
       </Container>

    );
  }
}

export default App;