#url: https://github.com/algorand/pyteal/tree/b1ab98396e42cb5fe4ca776e7cf4688329aba71d
#author: Algorand
#official PyTeal Documentation

from pyteal import *

class Poll:
    class Variables:
        title = Bytes("Title")
        creator = Bytes("Creator")
        options = Bytes("VotingChoices")
        end = Bytes("EndTime")

    class AppMethods:
        vote = Bytes("vote")

    def application_start(self):
    
        # Updates the global state during the creation of the poll
        on_creation = Seq([
            Assert(Txn.application_args.length() == Int(3)),
            App.globalPut(self.Variables.title, Txn.application_args[0]),
            App.globalPut(self.Variables.options, Txn.application_args[1]),
            App.globalPut(self.Variables.end, Btoi(Txn.application_args[2])),
            App.globalPut(self.Variables.creator, Txn.sender()),
            Approve()
        ])
        
        on_register = Return(Int(1))

        # Gets the choice from the application call arguments
        choice = Txn.application_args[1]

        # Gets the value from the global state
        choice_tally = App.globalGet(choice)

        #Checks whether the application call sender is the same as the smart contract's creator
        is_creator = Txn.sender() == App.globalGet(self.Variables.creator)

        #Gets the vote of the sender
        get_vote_of_sender = App.localGetEx(Int(0), App.id(), Bytes("voted"))
        
        # Checks whether the choice already exists, if it does, it increments it; if it does not, it adds it to the global state dictionary
        check_choice = If(choice_tally > Int(0), App.globalPut(choice, choice_tally + Int(1)), App.globalPut(choice, Int(1)))
        
        #Triggered when a vote is cast and handles the global and local state updates
        on_vote = Seq([
            If((Global.latest_timestamp() > App.globalGet(Bytes("EndTime"))), Return(Int(0))),
            get_vote_of_sender,
            If(get_vote_of_sender.hasValue(), Return(Int(0))),
            check_choice,
            App.localPut(Int(0), Bytes("voted"), choice),
            Return(Int(1)),
        ])
        
        # Entry point where different function gets invoked depending on the type of application call
        program = Cond(
            [Txn.application_id() == Int(0), on_creation],
            [Txn.on_completion() == OnComplete.DeleteApplication, Return(is_creator)],
            [Txn.on_completion() == OnComplete.UpdateApplication, Return(is_creator)],
            [Txn.on_completion() == OnComplete.OptIn, on_register],
            [Txn.on_completion() == OnComplete.NoOp, on_vote],
        )

        return program
        
    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))
