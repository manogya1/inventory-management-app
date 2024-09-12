'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'
import { pink } from '@mui/material/colors'

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  const addItem = async () => {
    if (!itemName || !quantity) return  // Don't allow empty input
    const docRef = doc(collection(firestore, 'inventory'), itemName)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data()
      await setDoc(docRef, { quantity: existingQuantity + parseInt(quantity) })
    } else {
      await setDoc(docRef, { quantity: parseInt(quantity) })
    }
    setItemName('')
    setQuantity('')
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleSearch = () => {
    const filteredInventory = inventory.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setInventory(filteredInventory)
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'space-between'}
      alignItems={'flex-start'}
      padding={4}
      bgcolor={'#f0f0f0'}
    >
      {/* Left Section: Add New Item */}
      <Box width="45%" padding={2} border="1px solid #ccc" borderRadius="8px" >
        <Typography variant={'h4'} color={'#333'} textAlign={'center'} marginBottom={3}>
          Add New Item
        </Typography>

        {/* TextField for Item Name */}
        <Stack spacing={3}>
          <TextField
            label="Item Name"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />

          {/* TextField for Quantity */}
          <TextField
            label="Quantity"
            type="number"
            variant="outlined"
            fullWidth
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          {/* Add Button */}
          <Button variant="contained" onClick={addItem} fullWidth>
            Add Item
          </Button>
        </Stack>
      </Box>

      {/* Right Section: Inventory List */}
      <Box width="50%" padding={2} border="1px solid #ccc" borderRadius="8px">
        <Typography variant={'h4'} color={'#333'} textAlign={'center'} marginBottom={3}>
          Inventory Items
        </Typography>

        {/* Search bar and button */}
        <Stack direction="row" spacing={2} marginBottom={3}>
          <TextField
            id="search-bar"
            label="Search Inventory"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Stack>

        {/* Display inventory items */}
        <Stack width="100%" spacing={2}>
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f9f9f9'}
              padding={2}
              borderRadius="8px"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
            >
              <Typography variant={'h6'} color={'#333'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'h6'} color={'#333'}>
                Quantity: {quantity}
              </Typography>
              <Stack direction={'row'} spacing={1}>
                <Button variant="outlined" onClick={() => addItem(name)}>
                  Add
                </Button>
                <Button variant="outlined" onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
