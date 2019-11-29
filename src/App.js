import { hot } from 'react-hot-loader/root';
import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function ActionButton(props) {

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Say Hello
    </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Hello Message"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Hello {props.name}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Ok
      </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

function App() {

  const [name, setName] = React.useState(' ');

  return (
    <Grid container spacing={1} direction="column">
      <Grid item xs={4}>
        <TextField id="standard-basic" label="Your Name" onChange={(e) => setName(e.target.value)} />
      </Grid>
      <Grid item xs={4}>
        <ActionButton name={name} />
      </Grid>
    </Grid>
  );
}

export default hot(App);