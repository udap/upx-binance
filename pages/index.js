import React, {useState, useEffect} from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import Link from 'next/link';
import _get from 'lodash/get';
import clsx from 'clsx';
import {SAGA_ACTIONS, STORE_ACTIONS} from '../redux/store';
import {validBnbAddr} from '../lib/core';
import {shortAddr, trimZero, numberWithCommas} from '../lib/share';

import {BNB_DEX_EXP, ETH_EXP, CREATE_BINANCE_ACCOUNT} from '../lib/constants';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import Chip from '@material-ui/core/Chip';
import SwapIcon from '@material-ui/icons/Autorenew';
import WarnIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import MySnackbarContentWrapper from '../components/Notice';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(10),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(10)
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '960px'
  },
  head: {
    display: 'flex',
    alignItems: 'center'
  },
  headword: {
    marginRight: theme.spacing(1)
  },
  caution: {
    margin: theme.spacing(2),
    backgroundColor: 'red',
    color: 'white',
    padding: theme.spacing(1)
  },
  warn: {
    backgroundColor: '#ffb300'
  },
  warnIcon: {
    color: '#ff6f00'
  },
  error: {
    backgroundColor: '#ef5350'
  },
  errorIcon: {
    color: '#b71c1c'
  },
  upx: {
    padding: theme.spacing(2),
    backgroundColor: '#81d4fa',
    width: '100%',
    marginTop: theme.spacing(5)
  },
  totalUpx: {
    margin: '10px 0 0 0'
  },
  progress: {
    marginRight: theme.spacing(1),
    color: 'white'
  },
  logo: {
    height: theme.spacing(4),
    marginRight: theme.spacing(2)
  },
  title: {
    fontSize: '1.2em'
  },
  accInfo: {
    backgroundColor: '#c5e1a5',
    marginBottom: theme.spacing(5),
    marginTop: theme.spacing(5),
    padding: theme.spacing(2),
    width: '100%'
  },
  balans: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: theme.spacing(2)
  },
  margRight: {
    marginRight: theme.spacing(4)
  },
  section: {
    border: `solid 1px grey`,
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    minWidth: '200px',
    textDecoration: 'none',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: '#9ccc65'
    },
    '&:link': {
      color: 'inherit'
    },
    '&:visited': {
      color: 'inherit'
    },
    '&:active': {
      color: 'inherit'
    }
  },
  disabled: {
    backgroundColor: 'transparent',
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: 'transparent',
      cursor: 'not-allowed'
    }
  },
  item: {
    margin: theme.spacing(2)
  },
  txtField: {
  },
  inputs: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bundleInput: {
    marginTop: theme.spacing(3),
    display: 'flex',
    alignItems: 'flex-end',
    width: '100%'
  },
  minBtn: {
    marginLeft: theme.spacing(2)
  },
  button: {
    marginTop: theme.spacing(2)
  },
  nostyleAnchor: {
    textDecoration: 'none',
    color: 'inherit'
  }
}));

function trim(number) {
  if (!number) {
    return number;
  }
  return Math.floor(number) + '';
}

function useSnackbar(txReceipt) {
  const [snackbarInfo, setSnackbarInfo] = useState({open: false, variant: 'success', msg: 'tx sent ok', id: ''});
  const now = new Date().getTime();
  if (
    txReceipt &&
    txReceipt.txHash !== snackbarInfo.id &&
    txReceipt.expire > now
  ) {
    const variant = txReceipt.success ? 'success' : 'error';
    const msg = txReceipt.success ? 'tx success' : 'tx failed';
    setSnackbarInfo({open: true, variant, msg, id: txReceipt.txHash});
  }
  const closeSnackbar = () => { setSnackbarInfo(Object.assign({}, snackbarInfo, {open: false})); };
  return [snackbarInfo, closeSnackbar];
}

let Index = function({
  account,
  bnbAddr,
  upx,
  upxb,
  totalUpx,
  bnb,
  eth,
  setBnbAddr,
  swapErc20,
  network,
  txReceipt,
  pendingTx,
  provider
}) {
  const classes = useStyles();
  const [fields, setFields] = useState({bnbAddress: '', upxAmount: 0});
  const [errors, setErrors] = useState({bnbAddress: false, upxAmount: false});

  const [{open: snackbarOpen, variant, msg}, closeSnackbar] = useSnackbar(txReceipt);

  useEffect(() => {
    if (validBnbAddr(fields.bnbAddress, network) || !fields.bnbAddress) {
      setBnbAddr(fields.bnbAddress);
    }
  }, [fields.bnbAddress]);

  const validForm = fields => {
    const {bnbAddress, upxAmount} = fields;
    const upxError = upxAmount <= 0 || upxAmount > upx;
    const bnbAddressError = !validBnbAddr(bnbAddress, network);
    setErrors({bnbAddress: bnbAddressError, upxAmount: upxError});
    return !upxError && !bnbAddressError;
  };

  const disableForm = !!pendingTx || !account;

  return (
    <React.Fragment>
      <AppBar>
        <Toolbar>
          <img src={'/static/assets/logo-page.png'} className={classes.logo} />
          <Typography variant={'h6'}>
            UPX to UPX.B Relay
          </Typography>
        </Toolbar>
      </AppBar>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        >
        <MySnackbarContentWrapper
          onClose={closeSnackbar}
          variant={variant}
          message={msg}
          />
      </Snackbar>
      <div className={classes.root}>
        <div className={classes.inner}>
          <div className={classes.head}>
            <Typography variant={'h6'} className={classes.headword}>{`ERC20 \u21e8 BEP2`}</Typography>
            {network === 3 && <Chip
              icon={<WarnIcon className={classes.warnIcon} />}
              size={'small'}
              label={'test network'}
              className={classes.warn}
              />
            }
            {network !== 1 && network !== 3 && <Chip
              icon={<ErrorIcon className={classes.errorIcon} />}
              size={'small'}
              label={'no connection'}
              className={classes.error}
              />
            }
          </div>
          <Typography variant={'h6'} className={classes.caution}>{`Caution!! UPX token not listed on Binance DEX yet!`}</Typography>
          <div className={classes.upx}>
            <Typography variant={'subtitle1'}>Calculated UPX Total Supply</Typography>
            <div className={classes.totalUpx}>{trimZero(totalUpx)}</div>
          </div>
          <div className={classes.accInfo}>
            <Typography variant={'subtitle1'}>{`My Account Info${account ? ' [' + shortAddr(account, 4) + ']' : ''}`}</Typography>
            <div className={classes.balans}>
              <Link href={account ? `${_get(ETH_EXP, [network])}/address/${account}` : 'javascript:;'}>
                <a target={'_blank'} className={clsx(classes.section, classes.margRight, !account && classes.disabled)}>
                  <div className={classes.item}>{`${numberWithCommas(eth)} ETH`}</div>
                  <div className={classes.item}>{`${numberWithCommas(upx)} UPX`}</div>
                </a>
              </Link>
              <Link href={bnbAddr ? `${_get(BNB_DEX_EXP, [network])}/address/${bnbAddr}` : 'javascript:;'}>
                <a target={'_blank'} className={clsx(classes.section, !bnbAddr && classes.disabled)}>
                  <div className={classes.item}>{`${numberWithCommas(trimZero(bnb))} BNB`}</div>
                  <div className={classes.item}>{`${numberWithCommas(trimZero(upxb))} UPX.B`}</div>
                </a>
              </Link>
            </div>
          </div>
          <div className={classes.bundleInput}>
            <FormControl className={classes.formControl} error={errors.bnbAddress} fullWidth>
              <InputLabel htmlFor={'bnb-addr'}>Binance chain address*</InputLabel>
              <Input
                required
                autoFocus
                id={'bnb-addr'}
                disabled={disableForm}
                value={fields.bnbAddress}
                inputProps={{spellCheck: false}}
                onChange={e => setFields({bnbAddress: e.target.value, upxAmount: fields.upxAmount})}
                aria-describedby={'bnb-addr-error'}
                />
              {errors.bnbAddress && <FormHelperText id='bnb-addr-error'>Binance chain address invalid</FormHelperText>}
            </FormControl>
            <Link href={CREATE_BINANCE_ACCOUNT[network] || 'javasctipt:;'}>
              <a target={'_blank'} className={classes.nostyleAnchor}>
                <Button variant={'outlined'} size={'small'} className={classes.minBtn} disabled={disableForm}>
                  Create
                </Button>
              </a>
            </Link>
          </div>
          <div className={classes.bundleInput}>
            <FormControl className={classes.formControl} error={errors.upxAmount} fullWidth>
              <InputLabel htmlFor={'bnb-addr'}>ERC20 UPX token amount*</InputLabel>
              <Input
                required
                id={'upx-amount'}
                disabled={disableForm}
                inputProps={{type: 'number', step: 1, min: 0, max: upx}}
                value={fields.upxAmount}
                onChange={e => setFields({bnbAddress: fields.bnbAddress, upxAmount: trim(e.target.value)})}
                aria-describedby={'upx-error'}
                />
              {errors.upxAmount && <FormHelperText id='upx-error'>UPX amount invalid</FormHelperText>}
            </FormControl>
            <Button variant={'outlined'} size={'small'} className={classes.minBtn}
              disabled={disableForm}
              onClick={e => setFields({bnbAddress: fields.bnbAddress, upxAmount: trim(upx)})}>All</Button>
          </div>
          <Button variant={'contained'} color={'secondary'} className={classes.button} size={'large'}
            disabled={disableForm}
            onClick={e => {
              if (validForm(fields)) {
                swapErc20(fields.bnbAddress, fields.upxAmount);
              }
            }}>
            {!!pendingTx && <CircularProgress size={20} className={classes.progress} />}
            Swap
            <SwapIcon />
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
};

Index = connect(
  ({
    account,
    bnbAddr,
    totalUpx,
    upx,
    eth,
    upxb,
    bnb,
    network,
    pendingTx,
    txReceipt,
    provider
  }) => ({account, bnbAddr, totalUpx, upx, eth, upxb, bnb, network, pendingTx, txReceipt, provider}),
  dispatch => ({
    swapErc20: bindActionCreators(SAGA_ACTIONS.swapErc20, dispatch),
    setBnbAddr: bindActionCreators(STORE_ACTIONS.setBnbAddr, dispatch)
  })
)(Index);

export default Index;
