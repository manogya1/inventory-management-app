'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, TextField, Autocomplete, Alert } from '@mui/material'
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

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)  // To store the selected item from the dropdown
  const [quantity, setQuantity] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)  // To store any error messages

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
    if (!selectedItem || !quantity) return  // Don't allow empty input
    const docRef = doc(collection(firestore, 'inventory'), selectedItem.name)
    const docSnap = await getDoc(docRef)
    const enteredQuantity = parseInt(quantity)

    // Check if entered quantity is greater than available stock
    if (enteredQuantity > selectedItem.quantity) {
      // Set error message to display in a popup or alert box
      setError(`Sorry, we don't have that many ${selectedItem.name} in stock. Available stock is ${selectedItem.quantity}.`)
      return  // Stop further execution
    }

    // If the item exists and the quantity check passes, update the quantity
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data()
      await setDoc(docRef, { quantity: existingQuantity - enteredQuantity })  // Reducing stock after adding to cart
    } else {
      setError(`Item not found in inventory.`)  // Handle case if item isn't found
    }

    setSelectedItem(null)
    setQuantity('')
    setError(null)  // Clear any error messages
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

  // Filter items that have quantity greater than 0 for the dropdown
  const itemsWithStock = inventory.filter(item => item.quantity > 0)

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      padding={4}
      bgcolor="#f5f5f5"
    >
      {/* Title at the top, centered */}
      <Typography variant="h3" color="#333" textAlign="center" marginBottom={5}>
        Mobile Store Inventory
      </Typography>

      {/* Left and Right sections in a row */}
      <Box 
        display="flex" 
        width="100%" 
        justifyContent="space-between" 
        padding={4} 
        maxWidth="1200px"
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)" 
        borderRadius="12px" 
        bgcolor="white"
      >
        {/* Left Section: Add New Item */}
        <Box 
          width="45%" 
          padding={3} 
          border="1px solid #ddd" 
          borderRadius="12px"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
        >
          <Typography variant="h4" color="#333" textAlign="center" marginBottom={3}>
            Add to Cart
          </Typography>

          {/* Dropdown for selecting an item with quantity > 0 */}
          <Stack spacing={3}>
            <Autocomplete
              options={itemsWithStock}  // Only show items with stock
              getOptionLabel={(option) => `${option.name} (Stock: ${option.quantity})`}  // Show item name with stock
              value={selectedItem}
              onChange={(event, newValue) => setSelectedItem(newValue)}  // Handle selection
              renderInput={(params) => <TextField {...params} label="Select Item" variant="outlined" />}
              fullWidth
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

            {/* Display Error Message */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
            )}

            {/* Add Button */}
            <Button variant="contained" onClick={addItem} fullWidth size="large" sx={{ fontSize: '16px', padding: '12px 0' }}>
              Checkout Item
            </Button>
          </Stack>
        </Box>

        {/* Right Section: Inventory List */}
        <Box 
          width="50%" 
          padding={3} 
          border="1px solid #ddd" 
          borderRadius="12px" 
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
          style={{ maxHeight: '500px', overflowY: 'auto' }}  // Add scrolling and limit height
        >
          <Typography variant="h4" color="#333" textAlign="center" marginBottom={3}>
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
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bgcolor="#f9f9f9"
                padding={2}
                borderRadius="8px"
                boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
              >
                <Typography variant="h6" color="#333">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h6" color="#333">
                  Quantity: {quantity}
                </Typography>
                <Stack direction="row" spacing={1}>
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
    </Box>
  )
}
