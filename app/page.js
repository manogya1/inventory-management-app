'use client'
import { useState, useEffect, use } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import { collection, deleteDoc, getDocs, query, setDoc } from 'firebase/firestore'


export default function Home() {
  const[inventory, setInventory] = useState([])
  const[open, setOpen] = useState(false)
  const[itemname, setItemName] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach(doc => {
      inventoryList.push(
        {
          name : doc.id,
          ...doc.data(),

        }
      )
    })
    setInventory(inventoryList)
  }

  const addItem = async (name) => {
    const docRef = doc(firestore, 'inventory', name)
    const docSnap = await getDoc(docRef)
    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
    }
    else {
      await setDoc(docRef, {quantity: 1})
    }
    await updateInventory()
  }


  const removeItem = async (name) => {
    const docRef = doc(firestore, 'inventory', name)
    const docSnap = await getDoc(docRef)
    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      if(quantity === 1){
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
  <Box
   width="100vh"
    height="100vh"
    display="flex"
    justifyContent="center"
    alignItems="center"
    gap = {2}
  >
    <Modal open={open} onClose={handleClose}>
    <Box
      position="absolute"
      top = "50%"
      left = "50%"
      width = {400}
      bgcolor = "white"
      border = "2px solid #000"
      boxShadow = {24}
      p={4}
      display="flex"
      flexDirection="column"
      gap={3}
      sx  = {{
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Typography variant='h6'> Add Item </Typography>
      <Stack width="100%" direction="row" spacing ={2}>
        <TextField
          variant = 'outlined'
          fullWidth
          value={itemname}
          onChange = {
            (e) => setItemName(e.target.value)
          }
        />
        <Button variant = "outlined" onClick={
          () => {
            addItem(itemname)
            setItemName('')
            handleClose()
          }
        }> Add </Button>
      </Stack>
    </Box>
    </Modal>
    <Button variant="outlined" onClick={()=>
      handleOpen()
    } 
    > Add Item 
    </Button>
    <Box border = '1px solid #333'>
    </Box> 
  </Box>
  )
}