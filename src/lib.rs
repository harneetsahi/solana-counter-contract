use borsh::{BorshDeserialize, BorshSerialize};

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

#[derive(BorshSerialize, BorshDeserialize)]
enum InstructionType {
    Increment(u32),
    Decrement(u32)
}

#[derive(BorshSerialize, BorshDeserialize)]
struct Counter {
    count: u32,
}


entrypoint!(counter_instruction);


pub fn counter_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let acc = next_account_info(&mut accounts.iter())?; 

    // converting bytes to structs
    let instruction_type = InstructionType::try_from_slice(instruction_data)?;

    let mut counter_data:Counter = Counter::try_from_slice(&acc.data.borrow())?;

    match instruction_type {
        InstructionType::Increment(value) => {
            counter_data.count += value;
 
        },

        InstructionType::Decrement(value) => {
            counter_data.count -= value;
        },
    };

    // converting back to bytes
    counter_data.serialize(&mut *acc.data.borrow_mut())?;

    msg!("Counter updated to {}", counter_data.count);

    Ok(())
}

